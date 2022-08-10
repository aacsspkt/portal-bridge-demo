import { CHAIN_ID_SOLANA, createWrappedOnSolana, hexToUint8Array, isEVMChain, postVaaSolanaWithRetry, toChainName } from '@certusone/wormhole-sdk';
import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { ethers } from 'ethers';
import * as React from 'react';
import { Dispatch } from 'redux';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { KEYPAIR, SOLANA_HOST, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS } from '../constants';
import { useEthereumProvider } from '../contexts/EthereumContextProvider';
import { signTransaction } from '../utils/solana';
import useToast from './useToast';

export async function solana(
	dispatch:Dispatch,
	payerAddress: string,
	signer: Keypair | ethers.Signer,
	signedVAA: Uint8Array,
) {
	if (!(signer instanceof Keypair)) throw new Error(`Signer should be instanceof Keypair. value: ${signer}`);

				const connection = new Connection(SOLANA_HOST);
				//post vaa
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
}



export default function useCreateWrappedToken() {
    	const dispatch = useAppDispatch();
	const targetChain = useAppSelector((state) => state.attest.targetChain);
	const signedVAA = useAppSelector((state) => state.attest.signedVAAHex);
    	const {
		toastSuccess,
		toastWarning,
		toastError,
		toastInfo,
		toastPromise,
		toastLoading,
		updateToast,
        } = useToast();
    const { signer } = useEthereumProvider();
    const solPK = KEYPAIR.publicKey;
    const handleCreateClick = async function () {

     
        if (isEVMChain(targetChain) && !!signer && !!signedVAA) {
            //create wrapped token for evm
        } else if (
            targetChain === CHAIN_ID_SOLANA &&
            !!solPK &&
            !!signedVAA
        ) {
            solana(
                dispatch,
                KEYPAIR.publicKey.toString(),
                KEYPAIR,
                hexToUint8Array(signedVAA),
            );
        }
    }

    return {
        handleCreateClick
      
  }
}
