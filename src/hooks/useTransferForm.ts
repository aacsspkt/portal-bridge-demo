import {
	useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ethers,
  Signer,
} from 'ethers';
import {
  parseUnits,
  zeroPad,
} from 'ethers/lib/utils';
import { SnackbarProvider } from 'notistack';

import {
  CHAIN_ID_KLAYTN,
  CHAIN_ID_SOLANA,
  ChainId,
  ChainName,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAAWithRetry,
  hexToUint8Array,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  transferFromEth,
  transferFromEthNative,
  transferFromSolana,
  transferNativeSol,
  toChainId,
  toChainName,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import {
  Connection,
  Keypair,
} from '@solana/web3.js';

import Alert from '../components/Alert';
import {
  getBridgeAddressForChain,
  getTokenBridgeAddressForChain,
  KEYPAIR,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import {
  getCorrespondingToken,
  isValidToken,
  transferTokens,
} from '../functions';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setAmount, setSourceChain, setTargetChain } from '../app/slices/transferSlice';

async function evm(
	dispatch: any,
	snackbar: SnackbarProvider,
	signer: Signer,
	tokenAddress: string,
	decimals: number,
	amount: string,
	recipientChain: ChainId,
	recipientAddress: Uint8Array,
	isNative: boolean,
	chainId: ChainId,
	relayerFee?: string,
) {
	const { enqueueSnackbar } = snackbar;

	try {
		const baseAmountParsed = parseUnits(amount, decimals);
		const feeParsed = parseUnits(relayerFee || "0", decimals);
		const transferAmountParsed = baseAmountParsed.add(feeParsed);
		console.log("base", baseAmountParsed, "fee", feeParsed, "total", transferAmountParsed);
		// Klaytn requires specifying gasPrice

		const overrides = chainId === CHAIN_ID_KLAYTN ? { gasPrice: (await signer.getGasPrice()).toString() } : {};
		const receipt = isNative
			? await transferFromEthNative(
					getTokenBridgeAddressForChain(chainId),
					signer,
					transferAmountParsed,
					recipientChain,
					recipientAddress,
					feeParsed,
					overrides,
			  )
			: await transferFromEth(
					getTokenBridgeAddressForChain(chainId),
					signer,
					tokenAddress,
					transferAmountParsed,
					recipientChain,
					recipientAddress,
					feeParsed,
					overrides,
			  );
		// dispatch(setTransferTx({ id: receipt.transactionHash, block: receipt.blockNumber }));
		enqueueSnackbar(null, {
			content: Alert({ severity: "success", children: "Transaction confirmed" }),
		});
		const sequence = parseSequenceFromLogEth(receipt, getBridgeAddressForChain(chainId));
		const emitterAddress = getEmitterAddressEth(getTokenBridgeAddressForChain(chainId));
		enqueueSnackbar(null, {
			content: Alert({ severity: "info", children: "Fetching VAA" }),
		});
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, chainId, emitterAddress, sequence.toString());
		// dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		enqueueSnackbar(null, {
			content: Alert({ severity: "success", children: "Fetched Signed VAA" }),
		});
	} catch (e) {
		console.error(e);
		enqueueSnackbar(null, {
			content: Alert({ severity: "error", children: e instanceof Error ? e.message : "An unknown error occured" }),
		});
		// dispatch(setIsSending(false));
	}
}

async function solana(
	dispatch: any,
	enqueueSnackbar: any,
	payer: Keypair,
	fromAddress: string,
	mintAddress: string,
	amount: string,
	decimals: number,
	targetChain: ChainId,
	targetAddress: Uint8Array,
	isNative: boolean,
	originAddressStr?: string,
	originChain?: ChainId,
	relayerFee?: string,
) {
	// dispatch(setIsSending(true));
	try {
		const connection = new Connection(SOLANA_HOST, "confirmed");
		const baseAmountParsed = parseUnits(amount, decimals);
		const feeParsed = parseUnits(relayerFee || "0", decimals);
		const transferAmountParsed = baseAmountParsed.add(feeParsed);
		const originAddress = originAddressStr ? zeroPad(hexToUint8Array(originAddressStr), 32) : undefined;
		const promise = isNative
			? await transferNativeSol(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer.publicKey.toString(),
					transferAmountParsed.toBigInt(),
					targetAddress,
					targetChain,
					feeParsed.toBigInt(),
			  )
			: await transferFromSolana(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer.publicKey.toString(),
					fromAddress,
					mintAddress,
					transferAmountParsed.toBigInt(),
					targetAddress,
					targetChain,
					originAddress,
					originChain,
					undefined,
					feeParsed.toBigInt(),
			  );
		const transaction = await promise;
		const txid = await sendAndConfirmTransaction(connection, signTransaction, transaction, 10);
		enqueueSnackbar(null, {
			content: Alert({ severity: "success", children: "Transaction confirmed" }),
		});
		const info = await connection.getTransaction(txid);
		if (!info) {
			throw new Error("An error occurred while fetching the transaction info");
		}
		// dispatch(setTransferTx({ id: txid, block: info.slot }));
		const sequence = parseSequenceFromLogSolana(info);
		const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
		enqueueSnackbar(null, {
			content: Alert({ severity: "info", children: "Fetching VAA" }),
		});
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, CHAIN_ID_SOLANA, emitterAddress, sequence);

		// dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		enqueueSnackbar(null, {
			content: Alert({ severity: "success", children: "Fetched Signed VAA" }),
		});
	} catch (e) {
		console.error(e);
		enqueueSnackbar(null, {
			content: Alert({ severity: "error", children: e instanceof Error ? e.message : "An unknowm error occured" }),
		});
		// dispatch(setIsSending(false));
	}
}
interface TokenTransferForm {
	sourceChain: ChainName;
	sourceToken: string;
	targetChain: ChainName;
	targetToken: string;
	transferAmount: string;
}

export const useTransferForm = (list: ChainName[]) => {
	const sourceChain = useAppSelector((state) => state.transfer.sourceChain)
	const targetChain = useAppSelector((state) => state.transfer.targetChain)
	const targetAsset = useAppSelector((state) => state.transfer.targetAsset)
	const sourceToken = useAppSelector((state) => state.transfer.sourceParsedTokenAccount);
	const amount = useAppSelector((state)=> state.transfer.amount)
	const dispatch = useAppDispatch();
	const [data, setData] = useState<TokenTransferForm>({
		sourceChain: list[0],
		sourceToken: "",
		targetChain: list[0],
		targetToken: "",
		transferAmount: "",
	});

	
	
	const handleSourceChainChange = useCallback(
		(event: any) => {
			console.log(event)
      dispatch(setSourceChain(toChainId(event)));
    },
    [dispatch]
  );
	const handleSourceTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			sourceToken: e.target.value,
		});
		
		
	};

	const handleTargetChainChange = useCallback(
		(event: any) => {
			console.log(event)
      dispatch(setTargetChain(toChainId(event)));
    },
    [dispatch]
  );

	const handleAmountChange =
		useCallback(
		(event: any) => {
			console.log(event.target.value)
				dispatch(setAmount(event.target.value));

    },
    [dispatch]
  );

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const detectedProvider = await detectEthereumProvider();
		const provider = new ethers.providers.Web3Provider(
			// @ts-ignore
			detectedProvider,
			"any",
		);

		const result = await transferTokens(
			toChainName(sourceChain),
			toChainName(targetChain),
			provider,
			data.sourceToken,
			parseFloat(amount),
			KEYPAIR.publicKey.toString(),
		);
		console.log("Result", result);
	};

	useEffect(() => {
		const getAndSetTargetToken = async () => {
			try {
				if (toChainName(sourceChain).includes(toChainName(targetChain))) {
					setData({
						...data,
						targetToken: "",
					});
					return;
				}

				console.log("Getting Target Token...");
				const detectedProvider = await detectEthereumProvider();
				const provider = new ethers.providers.Web3Provider(
					// @ts-ignore
					detectedProvider,
					"any",
				);

				if (isValidToken(data.sourceToken, toChainName(sourceChain))) {
					const targetToken = await getCorrespondingToken({
						dispatch: dispatch,
						sourceChain: toChainName(sourceChain),
						targetChain: toChainName(targetChain),
						tokenAddress: data.sourceToken,
						signer: provider.getSigner(),
					});
					

					console.log("targetToken:", targetAsset.address);

				}
			} catch (error) {
				console.log(error);
			}
		};

		if (data.sourceToken !== "") {
			getAndSetTargetToken();
		}
	}, [sourceChain, data.sourceToken, targetChain]);

	return {
		data,
		handleSourceChainChange,
		handleSourceTokenChange,
		handleTargetChainChange,
		handleAmountChange,
		handleSubmit,
	};
};
