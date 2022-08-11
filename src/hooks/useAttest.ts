import React, {
  useCallback,
  useEffect,
} from 'react';

import { ethers } from 'ethers';
import { toast } from 'react-toastify';

import {
  attestFromEth,
  attestFromSolana,
  CHAIN_ID_SOLANA,
  ChainName,
  CHAINS,
  createWrappedOnEth,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAAWithRetry,
  isEVMChain,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolanaWithRetry,
  toChainId,
  toChainName,
  uint8ArrayToHex,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import {
  Connection,
  Keypair,
  SendTransactionError,
} from '@solana/web3.js';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import {
  setAttestTx,
  setSignedVAAHex,
  setSourceAsset,
  setSourceChain,
  setTargetAsset,
  setTargetChain,
} from '../app/slices/attestSlice';
import { receiveDataWrapper } from '../app/slices/helpers';
import { AppDispatch } from '../app/store';
import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  KEYPAIR,
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
import useFetchTargetAsset from './useFetchTargetAsset';
import useToast from './useToast';

async function evm(dispatch: AppDispatch, signer: ethers.Signer, tokenAddress: string, sourceChain: ChainName) {
	toast.success("Attesting Token");
	console.log("Attesting token");
	const tokenAttestation = await attestFromEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, tokenAddress);
	toast.success("Attested Token");
	dispatch(setAttestTx({ id: tokenAttestation.transactionHash, block: tokenAttestation.blockNumber }));
	// toast success: txn confirmed
	console.log("token attest txn hash:", tokenAttestation.transactionHash);
	const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);

	console.log("emitterAddress:", emitterAddress);
	const sequence = parseSequenceFromLogEth(tokenAttestation, ETH_BRIDGE_ADDRESS);
	console.log("sequence:", sequence);
	toast.success("Fetching VAA");
	console.log("fetching vaa");
	const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, sourceChain, emitterAddress, sequence);
	console.log("vaa:", uint8ArrayToHex(vaaBytes));
	dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
	return vaaBytes;
	// toast success: fetched signed vaa
}
async function solana(dispatch: AppDispatch, signer: ethers.Signer, tokenAddress: string, sourceChain: ChainName) {
	try {
		const connection = new Connection(SOLANA_HOST, "confirmed");
		console.log("Attesting token");
		toast.success("Attesting Token");
		const transaction = await attestFromSolana(
			connection,
			SOL_BRIDGE_ADDRESS,
			SOL_TOKEN_BRIDGE_ADDRESS,
			KEYPAIR.publicKey.toString(),
			tokenAddress,
		);

		const txnIds: string = await sendAndConfirmTransaction(connection, signTransaction, transaction, 10);

		const txnRes = await connection.getTransaction(txnIds);
		if (!txnRes) {
			throw new Error("An error occurred while fetching the transaction info");
		}
		dispatch(setAttestTx({ id: txnIds, block: txnRes?.slot }));
		if (!txnRes) throw new Error("Transaction: " + txnIds + " not found");
		const solana_sequence = parseSequenceFromLogSolana(txnRes);
		const solana_emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
		toast.success("Fetching VAA");
		console.log("emitterAddress:", solana_emitterAddress);
		console.log("sequence:", solana_sequence);
		const { vaaBytes } = await getSignedVAAWithRetry(
			WORMHOLE_RPC_HOSTS,
			"solana",
			solana_emitterAddress,
			solana_sequence,
		);

		console.log("vaa:", vaaBytes.toString());
		dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
		toast.success("Fetched VAA");
		return vaaBytes;
	} catch (e) {
		console.error(e);
	}
}

export async function solana_create_Wrapped(
	dispatch: AppDispatch,
	payerAddress: string,
	signer: Keypair | ethers.Signer,
	signedVAA: Uint8Array,
) {
	try {
		if (!(signer instanceof Keypair)) throw new Error(`Signer should be instanceof Keypair. value: ${signer}`);

		const connection = new Connection(SOLANA_HOST);
		//post vaa
		toast.success("Posting Vaa to Solana");
		console.log("posting vaa to solana");
		await postVaaSolanaWithRetry(
			connection,
			signTransaction,
			SOL_BRIDGE_ADDRESS,
			payerAddress,
			Buffer.from(signedVAA),
			10,
		);

		console.log("creating txn to create wrapped token");
		toast.success("creating txn to create wrapped token");
		// create wrapped tokens
		const createWrappedTxn = await createWrappedOnSolana(
			connection,
			SOL_BRIDGE_ADDRESS,
			SOL_TOKEN_BRIDGE_ADDRESS,
			payerAddress,
			signedVAA,
		);
		await sendAndConfirmTransaction(connection, signTransaction, createWrappedTxn, 10);

		return;
	} catch (error) {
		if (error instanceof SendTransactionError) {
			console.log(error.logs);
		}
		throw error;
	}
}
export async function evm_create_wrapped(
	dispatch: AppDispatch,
	payerAddress: string,
	signer: ethers.Signer,
	signedVAA: Uint8Array,
) {
	try {
		console.log("creating txn to create wrapped token");
		toast.success("Creating txn to create wrapped token");
		// create wrapped tokens

		const createWrappedTxn = await createWrappedOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, signedVAA);
		console.log("createwrapperTx", createWrappedTxn);
		toast.success("created Wrapped Token");

		return;
	} catch (error) {
		if (error instanceof SendTransactionError) {
			console.log(error.logs);
		}
		throw error;
	}
}

export function useAttest() {
	const chainList: ChainName[] = Object.keys(CHAINS)
		.map((item) => item as ChainName)
		.filter((item) => item !== "unset");
	const { toastSuccess, toastWarning, toastError, toastInfo, toastPromise, toastLoading, updateToast } = useToast();
	const dispatch = useAppDispatch();
	const sourceChain = useAppSelector((state) => state.attest.sourceChain);
	const targetChain = useAppSelector((state) => state.attest.targetChain);
	const sourceToken = useAppSelector((state) => state.attest.sourceAsset);
	const targetToken = useAppSelector((state) => state.attest.targetAsset);
	const signedVAA = useAppSelector((state) => state.attest.signedVAAHex);
	useFetchTargetAsset();

	const handleChange = useCallback(
		(event: any) => {
			console.log(event.target.value);
			dispatch(setSourceAsset(event.target.value));
		},
		[dispatch],
	);

	const handleSourceChainChange = useCallback(
		(event: any) => {
			console.log(event);
			dispatch(setSourceChain(toChainId(event)));
			toastError("SourceChain");
		},
		[dispatch],
	);

	const handleTargetChainChange = useCallback(
		(event: any) => {
			console.log(event);
			dispatch(setTargetChain(toChainId(event)));
		},
		[dispatch],
	);

	useEffect(() => {
		const getAndSetTargetToken = async () => {
			const detectedProvider = await detectEthereumProvider();
			const provider = new ethers.providers.Web3Provider(
				// @ts-ignore
				detectedProvider,
				"any",
			);

			const targetToken = await getCorrespondingToken({
				dispatch: dispatch,
				sourceChain: toChainName(sourceChain),
				targetChain: toChainName(targetChain),
				tokenAddress: sourceToken,
				signer: provider.getSigner(),
			});

			console.log(targetToken);
			if (targetToken != null) {
				dispatch(
					setTargetAsset(
						receiveDataWrapper({
							address: targetToken,
							doesExist: true,
						}),
					),
				);
			}
		};

		if (toChainName(sourceChain) && sourceToken !== "" && targetChain) {
			getAndSetTargetToken();
		}
	}, [sourceToken, sourceChain, targetChain, targetToken, dispatch]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const detectedProvider = await detectEthereumProvider();
		const provider = new ethers.providers.Web3Provider(
			// @ts-ignore
			detectedProvider,
			"any",
		);

		let signedVAA;
		const signer = provider.getSigner();

		if (isEVMChain(sourceChain) && !!signer) {
			signedVAA = await evm(dispatch, signer, sourceToken, toChainName(sourceChain));
		} else if (sourceChain === CHAIN_ID_SOLANA) {
			signedVAA = await solana(dispatch, signer, sourceToken, toChainName(sourceChain));
		}
		console.log("signedVAA", signedVAA);

		if (signedVAA) {
			let targetAsset: string | null;

			do {
				if (isEVMChain(sourceChain) && !!signer) {
					await solana_create_Wrapped(dispatch, KEYPAIR.publicKey.toString(), KEYPAIR, signedVAA);
				} else if (sourceChain === CHAIN_ID_SOLANA) {
					await evm_create_wrapped(dispatch, KEYPAIR.publicKey.toString(), signer, signedVAA);
				}

				targetAsset = await getCorrespondingToken({
					dispatch: dispatch,
					tokenAddress: sourceToken,
					sourceChain: toChainName(sourceChain),
					targetChain: toChainName(targetChain),
					signer,
				});
			} while (targetAsset == null);

			dispatch(
				setTargetAsset(
					receiveDataWrapper({
						address: targetAsset,
						doesExist: true,
					}),
				),
			);
			console.log("wrapped token created:", targetAsset);
		} else {
			console.log("Error in token attestation");
		}
		// console.log("signedVaa", signedVAA)
	};

	return {
		chainList,
		handleChange,
		handleSourceChainChange,
		handleTargetChainChange,
		handleSubmit,
	};
}
