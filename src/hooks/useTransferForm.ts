import React, {
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

import {
  approveEth,
  CHAIN_ID_KLAYTN,
  CHAIN_ID_SOLANA,
  ChainId,
  ChainName,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAAWithRetry,
  hexToUint8Array,
  isEVMChain,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolanaWithRetry,
  redeemAndUnwrapOnSolana,
  redeemOnEth,
  redeemOnEthNative,
  redeemOnSolana,
  toChainId,
  transferFromEth,
  transferFromEthNative,
  transferFromSolana,
  transferNativeSol,
  tryNativeToHexString,
  tryUint8ArrayToNative,
} from '@certusone/wormhole-sdk';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import {
  ParsedTokenAccount,
  setAmount,
  setIsRedeeming,
  setIsSending,
  setRedeemTx,
  setSourceChain,
  setSourceParsedTokenAccount,
  setSourceWalletAddress,
  setTargetAddressHex,
  setTargetChain,
  setTransferTx,
} from '../app/slices/transferSlice';
import { AppDispatch } from '../app/store';
import {
  ETH_TOKEN_BRIDGE_ADDRESS,
  getBridgeAddressForChain,
  getTokenBridgeAddressForChain,
  isSolanaChain,
  KEYPAIR,
  MAX_VAA_UPLOAD_RETRIES_SOLANA,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import { useEthereumProvider } from '../contexts/EthereumContextProvider';
import { isNativeEligible } from '../utils/nativeAsset';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';
import useCheckIfWormholeWrapped from './useCheckIfWormholeWrapped';
import useFetchTargetAsset from './useFetchTargetAsset';
import useGetAvailableTokens from './useGetSourceParsedTokenAccounts';
import useToast, { UseToasts } from './useToast';
import useTransferTargetAddress from './useTransferTargetAddress';

/** transfer */
async function transferEvm(
	dispatch: AppDispatch,
	toasts: UseToasts,
	signer: Signer,
	tokenAddress: string,
	decimals: number,
	amount: string,
	recipientChain: ChainId,
	recipientAddress: Uint8Array,
	sourceChainId: ChainId,
	isNative?: boolean,
	relayerFee?: string,
) {
	const { toastSuccess, toastLoading, dismissToast, toastError } = toasts;
	dispatch(setIsSending(true));
	try {
		const baseAmountParsed = parseUnits(amount, decimals);
		const feeParsed = parseUnits(relayerFee || "0", decimals);
		const transferAmountParsed = baseAmountParsed.add(feeParsed);
		console.log("base", baseAmountParsed, "fee", feeParsed, "total", transferAmountParsed);
		// Klaytn requires specifying gasPrice
		const overrides = sourceChainId === CHAIN_ID_KLAYTN ? { gasPrice: (await signer.getGasPrice()).toString() } : {};

		const approveReceipt = await approveEth(
			ETH_TOKEN_BRIDGE_ADDRESS,
			tokenAddress,
			signer,
			parseUnits(amount, decimals),
			overrides,
		);
		toastSuccess("Token Approved on Eth");
		console.log("approve eth:", approveReceipt.transactionHash);

		const transferrReceipt = isNative
			? await transferFromEthNative(
					getTokenBridgeAddressForChain(sourceChainId),
					signer,
					transferAmountParsed,
					recipientChain,
					recipientAddress,
					feeParsed,
					overrides,
			  )
			: await transferFromEth(
					getTokenBridgeAddressForChain(sourceChainId),
					signer,
					tokenAddress,
					transferAmountParsed,
					recipientChain,
					recipientAddress,
					feeParsed,
					overrides,
			  );
		dispatch(setTransferTx({ id: transferrReceipt.transactionHash, block: transferrReceipt.blockNumber }));
		toastSuccess("Transfer Complete on Eth");
		const sequence = parseSequenceFromLogEth(transferrReceipt, getBridgeAddressForChain(sourceChainId));
		const emitterAddress = getEmitterAddressEth(getTokenBridgeAddressForChain(sourceChainId));
		const toastId = toastLoading("Fetching signed vaa");
		const { vaaBytes } = await getSignedVAAWithRetry(
			WORMHOLE_RPC_HOSTS,
			sourceChainId,
			emitterAddress,
			sequence.toString(),
		);
		dismissToast(toastId);
		toastSuccess("Fetched signed vaa");
		return vaaBytes;
	} catch (e) {
		console.error(e);
		toastError(e instanceof Error ? e.message : "An unknown errro occured.");
		dispatch(setIsSending(false));
	}
}

async function transferSolana(
	dispatch: AppDispatch,
	toasts: UseToasts,
	payer: string,
	fromAddress: string,
	mintAddress: string,
	amount: string,
	decimals: number,
	targetChain: ChainId,
	targetAddress: Uint8Array,
	isNative?: boolean,
	originAddressStr?: string,
	originChain?: ChainId,
	relayerFee?: string,
): Promise<Uint8Array | undefined> {
	const { toastSuccess, toastLoading, dismissToast, toastError } = toasts;
	dispatch(setIsSending(true));
	try {
		const connection = new Connection(SOLANA_HOST, "confirmed");
		const baseAmountParsed = parseUnits(amount, decimals);
		const feeParsed = parseUnits(relayerFee || "0", decimals);
		const transferAmountParsed = baseAmountParsed.add(feeParsed);
		const originAddress = originAddressStr ? zeroPad(hexToUint8Array(originAddressStr), 32) : undefined;

		const transaction = isNative
			? await transferNativeSol(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer,
					transferAmountParsed.toBigInt(),
					targetAddress,
					targetChain,
					feeParsed.toBigInt(),
			  )
			: await transferFromSolana(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer,
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

		const txid = await sendAndConfirmTransaction(connection, signTransaction, transaction, 10);
		console.log("transfer txn confirmed");
		console.log("txnid:", txid);

		const info = await connection.getTransaction(txid);
		if (!info) {
			throw new Error("An error occurred while fetching the transaction info");
		}
		toastSuccess("Transfer complete on solana.");
		dispatch(setTransferTx({ id: txid, block: info.slot }));
		const sequence = parseSequenceFromLogSolana(info);
		const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
		const toastId = toastLoading("Fetching signed vaa");
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, CHAIN_ID_SOLANA, emitterAddress, sequence);
		console.log("vaaBytes", vaaBytes);
		dismissToast(toastId);
		toastSuccess("Fetched signed vaa");
		return vaaBytes;
	} catch (e) {
		console.error(e);
		toastError(e instanceof Error ? e.message : "An unknown errro occured.");
		dispatch(setIsSending(false));
	}
	return undefined;
}

/** end transfer */

/** redeem */
async function redeemEvm(
	dispatch: AppDispatch,
	toasts: UseToasts,
	signer: ethers.Signer,
	signedVAA: Uint8Array,
	isNative: boolean,
	chainId: ChainId,
) {
	dispatch(setIsRedeeming(true));
	const { toastInfo, toastSuccess, toastError } = toasts;
	toastInfo("Redeeming token on evm");
	console.log("isNative:", isNative);

	console.log("Token bridge address", getTokenBridgeAddressForChain(chainId));
	try {
		// Klaytn requires specifying gasPrice
		const overrides = chainId === CHAIN_ID_KLAYTN ? { gasPrice: (await signer.getGasPrice()).toString() } : {};
		const receipt = isNative
			? await redeemOnEthNative(getTokenBridgeAddressForChain(chainId), signer, signedVAA, overrides)
			: await redeemOnEth(getTokenBridgeAddressForChain(chainId), signer, signedVAA, overrides);
		dispatch(setRedeemTx({ id: receipt.transactionHash, block: receipt.blockNumber }));
		console.log("txn hash:", receipt.transactionHash);
		toastSuccess("Token redeemed successfully");
	} catch (e) {
		console.log(e);
		toastError(e instanceof Error ? e.message : "An unknown error occured");
		dispatch(setIsRedeeming(false));
	}
}

async function redeemSolana(
	dispatch: AppDispatch,
	toasts: UseToasts,
	payerAddress: string,
	signedVAA: Uint8Array,
	isNative: boolean,
) {
	console.log("Begin Redeeming");
	dispatch(setIsRedeeming(true));
	const { toastInfo, toastSuccess, toastError } = toasts;
	console.log("SOLANA_HOST", SOLANA_HOST);
	console.log("isNative:", isNative);
	console.log(payerAddress);
	console.log(signedVAA);
	try {
		// if (!wallet.signTransaction) {
		//   throw new Error("wallet.signTransaction is undefined");
		// }
		const connection = new Connection(SOLANA_HOST, "confirmed");
		toastInfo("Posting Vaa on solana");
		await postVaaSolanaWithRetry(
			connection,
			signTransaction,
			SOL_BRIDGE_ADDRESS,
			KEYPAIR.publicKey.toString(),
			Buffer.from(signedVAA),
			MAX_VAA_UPLOAD_RETRIES_SOLANA,
		);
		toastSuccess("Vaa posted on Solana");
		toastInfo("Redeeming Token");
		const transaction = isNative
			? await redeemAndUnwrapOnSolana(connection, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS, payerAddress, signedVAA)
			: await redeemOnSolana(connection, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS, payerAddress, signedVAA);

		const txid = await sendAndConfirmTransaction(connection, signTransaction, transaction);
		dispatch(setRedeemTx({ id: txid, block: 1 }));
		console.log("txn hash:", txid);
		toastSuccess("Token redeemed successfully");
	} catch (e) {
		console.log(e);
		toastError(e instanceof Error ? e.message : "An unknown error occured");
		dispatch(setIsRedeeming(false));
	}
}
/** end redeem */

export default function useTransferForm(list: ChainName[]) {
	const dispatch = useAppDispatch();
	useGetAvailableTokens();
	useCheckIfWormholeWrapped();
	useFetchTargetAsset();

	const sourceChain = useAppSelector((state) => state.transfer.sourceChain);
	const sourceWalletAddress = useAppSelector((state) => state.transfer.sourceWalletAddress);
	const sourceParsedTokenAccount = useAppSelector((state) => state.transfer.sourceParsedTokenAccount);
	const targetChain = useAppSelector((state) => state.transfer.targetChain);
	const targetAsset = useAppSelector((state) => state.transfer.targetAsset.data?.address);
	const targetAddressHex = useAppSelector((state) => state.transfer.targetAddressHex);
	const amount = useAppSelector((state) => state.transfer.amount);
	const originAsset = useAppSelector((state) => state.transfer.originAsset);
	const originChain = useAppSelector((state) => state.transfer.originChain);
	const sourceParsedTokenAccounts = useAppSelector((state) => state.transfer.sourceParsedTokenAccounts);

	const [isAmountDisabled, setIsAmountDisabled] = useState(true);
	const { signer, signerAddress, connect, walletConnected } = useEthereumProvider();
	const solPK = KEYPAIR.publicKey.toString();

	let targetAddress = useTransferTargetAddress();

	useEffect(() => {
		if (!sourceParsedTokenAccount) {
			setIsAmountDisabled(true);
		} else {
			setIsAmountDisabled(false);
		}
	}, [sourceParsedTokenAccount]);

	useEffect(() => {
		if (!sourceWalletAddress) {
			if (isSolanaChain(sourceChain)) {
				dispatch(setSourceWalletAddress(solPK));
			}
			if (isEVMChain(sourceChain)) {
				if (!walletConnected) {
					connect();
				}
				dispatch(setSourceWalletAddress(signerAddress));
			}
		}
	}, [dispatch, connect, walletConnected, sourceChain, sourceWalletAddress, signerAddress, solPK]);

	useEffect(() => {
		if (!targetAddressHex) {
			if (isSolanaChain(targetChain)) {
				try {
					dispatch(setTargetAddressHex(tryNativeToHexString(solPK, targetChain)));
				} catch (error) {
					dispatch(setTargetAddressHex(undefined));
				}
			}
			if (isEVMChain(targetChain)) {
				if (!walletConnected) {
					connect();
				}
				if (signerAddress) dispatch(setTargetAddressHex(tryNativeToHexString(signerAddress, targetChain)));
				else dispatch(setTargetAddressHex(undefined));
			}
		}
	}, [dispatch, targetChain, walletConnected, connect, targetAddressHex, solPK, signerAddress]);

	const toasts = useToast();
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
		(value: string) => {
			dispatch(setAmount(value));
		},
		[dispatch],
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!signer || !KEYPAIR) throw new Error("Required value missing");

		let signedVaa: Uint8Array | undefined;
		// let targetAddress: Uint8Array;
		if (sourceParsedTokenAccount && targetAddress && sourceWalletAddress) {
			console.log(targetAddressHex);
			console.log(targetAsset);
			if (isSolanaChain(targetChain) && targetAsset) {
				const connection = new Connection(SOLANA_HOST);
				const owner = tryUint8ArrayToNative(targetAddress, targetChain);
				console.log("target chain owner:", owner);
				const tokenAccount = await getOrCreateAssociatedTokenAccount(
					connection,
					KEYPAIR,
					new PublicKey(targetAsset),
					new PublicKey(owner),
				);
				console.log("tokenWallet:", tokenAccount.address.toString());
				targetAddress = tokenAccount.address.toBytes();
			}

			if (isSolanaChain(sourceChain)) {
				signedVaa = await transferSolana(
					dispatch,
					toasts,
					sourceWalletAddress,
					sourceParsedTokenAccount.publicKey,
					sourceParsedTokenAccount.mintKey,
					amount,
					sourceParsedTokenAccount.decimals,
					targetChain,
					targetAddress,
					sourceParsedTokenAccount.isNativeAsset,
					originAsset,
					originChain,
				);
			} else if (isEVMChain(sourceChain) && !!signer) {
				signedVaa = await transferEvm(
					dispatch,
					toasts,
					signer,
					sourceParsedTokenAccount.mintKey,
					sourceParsedTokenAccount.decimals,
					amount,
					targetChain,
					targetAddress,
					sourceChain,
					sourceParsedTokenAccount.isNativeAsset,
				);
			} else {
			}

			console.log("signedVaa", signedVaa);

			if (targetAsset && signedVaa) {
				if (isEVMChain(targetChain)) {
					console.log("redeem on eth");
					await redeemEvm(dispatch, toasts, signer, signedVaa, isNativeEligible(targetAsset), targetChain);
				} else if (isSolanaChain(targetChain)) {
					const solPk = KEYPAIR.publicKey.toString();
					console.log("redeem on solana");
					await redeemSolana(dispatch, toasts, solPk, signedVaa, isNativeEligible(targetAsset));
				} else {
				}
			}
		}
	};

	return {
		sourceChain,
		targetChain,
		sourceParsedTokenAccount,
		sourceParsedTokenAccounts,
		targetAsset,
		targetAddressHex,
		amount,
		isAmountDisabled,
		handleSourceChainChange,
		handleSourceTokenAccountChange,
		handleTargetChainChange,
		handleAmountChange,
		handleSubmit,
	};
}
