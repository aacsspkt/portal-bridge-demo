import React, {
	Dispatch,
  useCallback,
  useEffect,
} from 'react';

import { ethers } from 'ethers';

import {
  attestFromEth,
  attestFromSolana,
  ChainName,
  CHAINS,
  CHAIN_ID_SOLANA,
  createWrappedOnEth,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAAWithRetry,
  hexToUint8Array,
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
import { AppDispatch } from '../app/store';
import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  KEYPAIR,
  SOLANA_HOST,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import { getCorrespondingToken, isValidToken } from '../functions';
import useToast from './useToast';
import useFetchTargetAsset from './useFetchTargetAsset';
import { Connection, Keypair, SendTransactionError } from '@solana/web3.js';
import { sendAndConfirmTransaction, signTransaction } from '../utils/solana';
import { toast } from 'react-toastify';
import { receiveDataWrapper } from '../app/slices/helpers';

async function evm(
	dispatch: AppDispatch,
	signer: ethers.Signer, 
	tokenAddress: string, 
	sourceChain: ChainName) {
	toast.success("Attesting Token")
	console.log("Attesting token");
	const tokenAttestation = await attestFromEth(
		ETH_TOKEN_BRIDGE_ADDRESS,
		signer,
		tokenAddress);
		toast.success("Attested Token")
	dispatch(setAttestTx({ id: tokenAttestation.transactionHash, block: tokenAttestation.blockNumber }));
	// toast success: txn confirmed
	console.log("token attest txn hash:", tokenAttestation.transactionHash);
	const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);

	console.log("emitterAddress:", emitterAddress);
	const sequence = parseSequenceFromLogEth(tokenAttestation, ETH_BRIDGE_ADDRESS);
	console.log("sequence:", sequence);
	const toastId= toast.loading("Fetching signed vaa");
	console.log("fetching vaa");
	const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, sourceChain, emitterAddress, sequence);
	console.log("vaa:", uint8ArrayToHex(vaaBytes));
	toast.update(toastId, {type:"success",render:"Fetched VAA", isLoading:false, autoClose:3000})
	dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
	return vaaBytes
	// toast success: fetched signed vaa
}
async function solana(
	dispatch: AppDispatch,
	signer: ethers.Signer, 
	tokenAddress: string, 
	sourceChain: ChainName){
		try{
			const connection = new Connection(SOLANA_HOST, "confirmed");
			console.log("Attesting token");
			toast.success("Attesting Token")
			const transaction = await attestFromSolana(
			  connection,
			  SOL_BRIDGE_ADDRESS,
			  SOL_TOKEN_BRIDGE_ADDRESS,
			  KEYPAIR.publicKey.toString(),
			  tokenAddress
			);
			
			const txnIds :string = await sendAndConfirmTransaction(connection, signTransaction, transaction, 10);
			
			const txnRes = await connection.getTransaction(txnIds);
			 if (!txnRes) {

			throw new Error("An error occurred while fetching the transaction info");
			}
			dispatch(setAttestTx({ id: txnIds, block: txnRes?.slot }));
			if (!txnRes) throw new Error("Transaction: " + txnIds + " not found");
			const solana_sequence = parseSequenceFromLogSolana(txnRes);
			const solana_emitterAddress = await getEmitterAddressSolana(
			  SOL_TOKEN_BRIDGE_ADDRESS
			);
			const toastId = toast.loading("Fetching VAA");
			console.log("emitterAddress:", solana_emitterAddress);
			console.log("sequence:", solana_sequence);
			const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, "solana", solana_emitterAddress, solana_sequence);

			console.log("vaa:", vaaBytes.toString());
			dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
			toast.update(toastId, {type:"success",render:"Fetched VAA", isLoading:false, autoClose:3000})
			return vaaBytes
		}
		catch (e) {
			console.error(e);

		  }
		


}

export async function solana_create_Wrapped(
	dispatch:AppDispatch,
	payerAddress: string,
	signer: Keypair | ethers.Signer,
	signedVAA: Uint8Array,
) {
	try {
if (!(signer instanceof Keypair)) throw new Error(`Signer should be instanceof Keypair. value: ${signer}`);

				const connection = new Connection(SOLANA_HOST);
				//post vaa
			toast.success("Posting Vaa to Solana")
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
			const toastId= toast.loading("Creating txn to create wrapped token")
				// create wrapped tokens
				const createWrappedTxn = await createWrappedOnSolana(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payerAddress,
					signedVAA,
				);
		await sendAndConfirmTransaction(connection, signTransaction, createWrappedTxn, 10);
		toast.update(toastId, {type:"success",render:"Created Wrapped Token", isLoading:false, autoClose:3000})

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
		const toastId= toast.loading("Creating txn to create wrapped token")
		// create wrapped tokens
					
		const createWrappedTxn = await createWrappedOnEth(
			ETH_TOKEN_BRIDGE_ADDRESS,
			signer,
			signedVAA
		);
		toast.update(toastId, {type:"success",render:"Created Wrapped Token", isLoading:false, autoClose:3000})
		console.log("createwrapperTx", createWrappedTxn);

	
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
	const {
		toastSuccess,
		toastWarning,
		toastError,
		toastInfo,
		toastPromise,
		toastLoading,
		updateToast,
	} = useToast();
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
			if (!isValidToken(sourceToken, toChainName(sourceChain)))
			{
				toast.error("Enter valid address")
				return
			}

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
									doesExist: targetToken !== ethers.constants.AddressZero,
									address: targetToken,
								}),
							),
						);
				
			}
		};

		if (toChainName(sourceChain) && sourceToken !== "" && targetChain) {
			getAndSetTargetToken();
		}
	}, [sourceToken, sourceChain, targetChain, dispatch]);

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
			signedVAA= await evm(dispatch, signer, sourceToken, toChainName(sourceChain));

		}
		else if (sourceChain === CHAIN_ID_SOLANA) {
			signedVAA= await solana(dispatch, signer, sourceToken, toChainName(sourceChain));
		}
		console.log("signedVAA", signedVAA);
	

		if (signedVAA) {
			let targetAsset: string | null;

			do {
				if (isEVMChain(sourceChain) && !!signer) {
					await solana_create_Wrapped(
						dispatch,
						KEYPAIR.publicKey.toString(),
						KEYPAIR,
						signedVAA,
					);

				}
				else if (sourceChain === CHAIN_ID_SOLANA) {
					await evm_create_wrapped(
							dispatch,
							KEYPAIR.publicKey.toString(),
							signer,
							signedVAA,
						);
				}
				
				
				targetAsset = await getCorrespondingToken({
					dispatch: dispatch,
					tokenAddress: sourceToken,
					sourceChain: toChainName(sourceChain),
					targetChain: toChainName(targetChain),
					signer,
				});
			} while (targetAsset == null);
			toast.success("Wrapped Token Created");

			dispatch(
				setTargetAsset(
					receiveDataWrapper({
							doesExist: targetAsset !== ethers.constants.AddressZero,
							address: targetAsset,
						}),
					));
			console.log("Wrapped token created:", targetAsset);
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