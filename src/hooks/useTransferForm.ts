import React, {
  useCallback,
  useEffect,
} from 'react';

import {
  ethers,
  Signer,
} from 'ethers';
import {
  parseUnits,
  zeroPad,
} from 'ethers/lib/utils';

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
  toChainId,
  toChainName,
  transferFromEth,
  transferFromEthNative,
  transferFromSolana,
  transferNativeSol,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import {
  Connection,
  Keypair,
} from '@solana/web3.js';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import {
  ParsedTokenAccount,
  setAmount,
  setSourceChain,
  setSourceParsedTokenAccount,
  setTargetAddressHex,
  setTargetChain,
} from '../app/slices/transferSlice';
import { AppDispatch } from '../app/store';
import {
  getBridgeAddressForChain,
  getTokenBridgeAddressForChain,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import { getCorrespondingToken } from '../functions';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';
import { useEthereumProvider } from './EthereumContextProvider';
import useToast from './useToast';

async function evm(
	dispatch: AppDispatch,
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
		// toast success: txn confirmed
		const sequence = parseSequenceFromLogEth(receipt, getBridgeAddressForChain(chainId));
		const emitterAddress = getEmitterAddressEth(getTokenBridgeAddressForChain(chainId));
		// toast info or loading: fetching vaa
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, chainId, emitterAddress, sequence.toString());
		// dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		// toast success: fetched signed vaa
	} catch (e) {
		console.error(e);
		// toast error: e instanceOf Error ? e.message : 'unkown error occured'
		// dispatch(setIsSending(false));
	}
}

async function solana(
	dispatch: AppDispatch,
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
		// toast success: txn confirmed

		const info = await connection.getTransaction(txid);
		if (!info) {
			throw new Error("An error occurred while fetching the transaction info");
		}
		// dispatch(setTransferTx({ id: txid, block: info.slot }));
		const sequence = parseSequenceFromLogSolana(info);
		const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
		// toast info or loading: fetching vaa
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, CHAIN_ID_SOLANA, emitterAddress, sequence);

		// dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		// toast success: fetched signed vaa
	} catch (e) {
		console.error(e);
		// toast error: e instanceOf Error ? e.message : 'unkown error occured'
		// dispatch(setIsSending(false));
	}
}

export const useTransferForm = (list: ChainName[]) => {
	const dispatch = useAppDispatch();
	const sourceChain = useAppSelector((state) => state.transfer.sourceChain);
	const targetChain = useAppSelector((state) => state.transfer.targetChain);
	const sourceParsedTokenAccount = useAppSelector((state) => state.transfer.sourceParsedTokenAccount);
	const targetAsset = useAppSelector((state) => state.transfer.targetAsset);
	const targetAddressHex = useAppSelector((state) => state.transfer.targetAddressHex);
	const amount = useAppSelector((state) => state.transfer.amount);
	const originAsset = useAppSelector((state) => state.transfer.originAsset);
	const originChain = useAppSelector((state) => state.transfer.originChain);
	const { provider, signer } = useEthereumProvider();

	const { toastSuccess } = useToast();
	// if (!sourceParsedTokenAccount) throw new ArgumentNullOrUndefinedError();

	const handleSourceChainChange = useCallback(
		(chain: ChainName) => {
			dispatch(setSourceChain(toChainId(chain)));
		},
		[dispatch],
	);

	const handleSourceTokenAccountChange = useCallback(
		(parsedToken: ParsedTokenAccount) => {
			dispatch(setSourceParsedTokenAccount(parsedToken));
		},
		[dispatch],
	);

	const handleTargetChainChange = useCallback(
		(chain: ChainName) => {
			dispatch(setTargetChain(toChainId(chain)));
		},
		[dispatch],
	);

	const handleAmountChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			dispatch(setAmount(event.target.value));
		},
		[dispatch],
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const detectedProvider = await detectEthereumProvider();
		const provider = new ethers.providers.Web3Provider(
			// @ts-ignore
			detectedProvider,
			"any",
		);

		toastSuccess("Transfer Clicked");

		// const { signerAddress, walletConnected, signer, connect } = useEthereumProvider();
		// if (!walletConnected) connect();
		// dispatch(setTargetAddressHex(signerAddress));

		// const relayerFee = useAppSelector(state => state.transfer.relayerFee);
		// if (sourceParsedTokenAccount && targetAddressHex) {
		// 	const result = await transferTokens(
		// 		toChainName(sourceChain),
		// 		toChainName(targetChain),
		// 		provider,
		// 		sourceParsedTokenAccount,
		// 		targetAddressHex,
		// 		parseFloat(amount),
		// 		KEYPAIR.publicKey.toString(),
		// 		originAsset,
		// 		originChain ? toChainName(originChain) : undefined,
		// 	);
		// 	console.log("Result", result);
		// }
	};

	useEffect(() => {
		const getAndSetTargetToken = async (sourceChain: ChainName, targetChain: ChainName, tokenAddress: string) => {
			if (sourceChain.includes(targetChain)) {
				return;
			}

			console.log("Getting Target Token...");
			const detectedProvider = await detectEthereumProvider();
			const provider = new ethers.providers.Web3Provider(
				// @ts-ignore
				detectedProvider,
				"any",
			);
			const signer = provider.getSigner();
			dispatch(setTargetAddressHex((await provider.listAccounts()).at(0)));

			await getCorrespondingToken({
				dispatch,
				tokenAddress,
				sourceChain,
				targetChain,
				signer,
			});
		};

		if (sourceParsedTokenAccount?.mintKey) {
			getAndSetTargetToken(toChainName(sourceChain), toChainName(targetChain), sourceParsedTokenAccount.mintKey);
		}
	}, [sourceChain, sourceParsedTokenAccount, targetChain]);

	return {
		handleSourceChainChange,
		handleSourceTokenAccountChange,
		handleTargetChainChange,
		handleAmountChange,
		handleSubmit,
	};
};
