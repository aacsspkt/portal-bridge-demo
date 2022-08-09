import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Signer } from 'ethers';
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
  redeemAndUnwrapOnSolana,
  redeemOnEth,
  redeemOnEthNative,
  redeemOnSolana,
  toChainId,
  transferFromEth,
  transferFromEthNative,
  transferFromSolana,
  transferNativeSol,
  uint8ArrayToHex,
} from '@certusone/wormhole-sdk';
import {
  postVaaWithRetry,
} from '@certusone/wormhole-sdk/lib/cjs/solana/postVaa';
import { Connection } from '@solana/web3.js';

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
  setSignedVAAHex,
  setSourceChain,
  setSourceParsedTokenAccount,
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
import useToast from './useToast';
import useTransferSignedVAA from './useTransferSignedVAA';
import useTransferTargetAddress from './useTransferTargetAddress';

/** transfer */
async function transferToEvm(
	dispatch: AppDispatch,
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
		// toast success: txn confirmed
		const sequence = parseSequenceFromLogEth(transferrReceipt, getBridgeAddressForChain(sourceChainId));
		const emitterAddress = getEmitterAddressEth(getTokenBridgeAddressForChain(sourceChainId));
		// toast info or loading: fetching vaa
		const { vaaBytes } = await getSignedVAAWithRetry(
			WORMHOLE_RPC_HOSTS,
			sourceChainId,
			emitterAddress,
			sequence.toString(),
		);
		dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		// toast success: fetched signed vaa
	} catch (e) {
		console.error(e);
		// toast error: e instanceOf Error ? e.message : 'unkown error occured'
		dispatch(setIsSending(false));
	}
}

async function transferToSolana(
	dispatch: AppDispatch,
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
) {
	dispatch(setIsSending(true));
	console.log("isNative:", isNative);
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
		// toast success: txn confirmed
		console.log("transfer txn confirmed");
		console.log("txnid:", txid);

		const info = await connection.getTransaction(txid);
		if (!info) {
			throw new Error("An error occurred while fetching the transaction info");
		}
		dispatch(setTransferTx({ id: txid, block: info.slot }));
		const sequence = parseSequenceFromLogSolana(info);
		const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
		// toast info or loading: fetching vaa
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, CHAIN_ID_SOLANA, emitterAddress, sequence);

		console.log("vaaBytes", vaaBytes);
		dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		// toast success: fetched signed vaa
	} catch (e) {
		console.error(e);
		// toast error: e instanceOf Error ? e.message : 'unkown error occured'
		dispatch(setIsSending(false));
	}
}

/** end transfer */

/** redeem */
async function redeemEvm(dispatch: any, signer: Signer, signedVAA: Uint8Array, isNative: boolean, chainId: ChainId) {
	dispatch(setIsRedeeming(true));
	console.log("redeeming...");
	console.log("isNative:", isNative);
	try {
		// Klaytn requires specifying gasPrice
		const overrides = chainId === CHAIN_ID_KLAYTN ? { gasPrice: (await signer.getGasPrice()).toString() } : {};
		const receipt = isNative
			? await redeemOnEthNative(getTokenBridgeAddressForChain(chainId), signer, signedVAA, overrides)
			: await redeemOnEth(getTokenBridgeAddressForChain(chainId), signer, signedVAA, overrides);
		dispatch(setRedeemTx({ id: receipt.transactionHash, block: receipt.blockNumber }));
		console.log("txn hash:", receipt.transactionHash);
		// toast redeemed txn confirmed.
	} catch (e) {
		// toast error
		dispatch(setIsRedeeming(false));
	}
}

async function redeemSolana(
	dispatch: any,
	payerAddress: string, //TODO: we may not need this since we have wallet
	signedVAA: Uint8Array,
	isNative: boolean,
) {
	dispatch(setIsRedeeming(true));
	console.log("redeeming...");
	console.log("isNative:", isNative);
	try {
		// if (!wallet.signTransaction) {
		//   throw new Error("wallet.signTransaction is undefined");
		// }
		const connection = new Connection(SOLANA_HOST, "confirmed");
		await postVaaWithRetry(
			connection,
			signTransaction,
			SOL_BRIDGE_ADDRESS,
			payerAddress,
			Buffer.from(signedVAA),
			MAX_VAA_UPLOAD_RETRIES_SOLANA,
		);

		const transaction = isNative
			? await redeemAndUnwrapOnSolana(connection, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS, payerAddress, signedVAA)
			: await redeemOnSolana(connection, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS, payerAddress, signedVAA);

		const txid = await sendAndConfirmTransaction(connection, signTransaction, transaction);
		dispatch(setRedeemTx({ id: txid, block: 1 }));
		console.log("txn hash:", txid);
		// toast success redeem txn
	} catch (e) {
		// toast error
		dispatch(setIsRedeeming(false));
	}
}
/** end redeem */

export default function useTransferForm(list: ChainName[]) {
	const dispatch = useAppDispatch();
	const sourceChain = useAppSelector((state) => state.transfer.sourceChain);
	const sourceWalletAddress = useAppSelector((state) => state.transfer.sourceWalletAddress);
	const sourceParsedTokenAccount = useAppSelector((state) => state.transfer.sourceParsedTokenAccount);
	const targetChain = useAppSelector((state) => state.transfer.targetChain);
	const targetAsset = useAppSelector((state) => state.transfer.targetAsset);
	const targetAddressHex = useAppSelector((state) => state.transfer.targetAddressHex);
	const amount = useAppSelector((state) => state.transfer.amount);
	const originAsset = useAppSelector((state) => state.transfer.originAsset);
	const originChain = useAppSelector((state) => state.transfer.originChain);
	const sourceParsedTokenAccounts = useAppSelector((state) => state.transfer.sourceParsedTokenAccounts);
	const targetAddress = useTransferTargetAddress();
	const [isAmountDisabled, setIsAmountDisabled] = useState(true);
	const signedVaa = useTransferSignedVAA();

	useEffect(() => {
		if (!sourceParsedTokenAccount) {
			setIsAmountDisabled(true);
		} else {
			setIsAmountDisabled(false);
		}
	}, [sourceParsedTokenAccount]);

	const { signer } = useEthereumProvider();

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
		(value: string) => {
			dispatch(setAmount(value));
		},
		[dispatch],
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!signer || !KEYPAIR) throw new Error("Required value missing");

		console.log("sourceChain", sourceChain);
		console.log("targetChain", targetChain);
		console.log("sourceParsedTokenAccount", sourceParsedTokenAccount);
		console.log("sourceWalletAddress", sourceWalletAddress);
		console.log("targetAsset", targetAsset);
		console.log("originChain", originChain);
		console.log("originAsset", originAsset);
		console.log("amount", amount);
		console.log("targetAddress", targetAddress);

		toastSuccess("Transfer Clicked"); // testing

		if (sourceParsedTokenAccount && targetAddress && sourceWalletAddress) {
			if (isSolanaChain(sourceChain)) {
				console.log("transfering to solana");
				await transferToSolana(
					dispatch,
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
				console.log("transfering to eth");
				await transferToEvm(
					dispatch,
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

			const targetAssetAddress = targetAsset.data?.address;

			if (targetAssetAddress && signedVaa) {
				if (isEVMChain(targetChain)) {
					console.log("redeem on eth");
					await redeemEvm(dispatch, signer, signedVaa, isNativeEligible(targetAssetAddress), sourceChain);
				} else if (isSolanaChain(targetChain)) {
					const solPk = KEYPAIR.publicKey.toString();
					console.log("redeem on solana");
					await redeemSolana(dispatch, solPk, signedVaa, isNativeEligible(targetAssetAddress));
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
