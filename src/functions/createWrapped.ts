import { ethers } from 'ethers';

import {
  ChainName,
  createWrappedOnSolana,
  postVaaSolanaWithRetry,
} from '@certusone/wormhole-sdk';
import {
  Connection,
  Keypair,
  SendTransactionError,
} from '@solana/web3.js';

import {
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
} from '../constants';
// import {
//   BRIDGE_ADDRESS_TESTNET,
//   CONNECTION_TESTNET as connection,
//   RECIPIENT_WALLET_ADDRESS_TESTNET,
//   TOKEN_BRIDGE_ADDRESS_TESTNET,
// } from '../constants_testnet';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';
import { Dispatch } from 'redux';

/**
 * @param payerAddress Public Key of the fee payer
 * @param targetChain Source Chain Name
 * @param signer Signer who signs and pay
 * @param signedVAA Vaa obtained after attestation
 * @returns Array of transaction signature
 */
export async function createWrappedTokens(
	dispatch:Dispatch,
	targetChain: ChainName,
	payerAddress: string,
	signer: Keypair | ethers.Signer,
	signedVAA: Uint8Array,
) {
	switch (targetChain) {
		case "solana": {
			try {
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
			} catch (error) {
				if (error instanceof SendTransactionError) {
					console.log(error.logs);
				}
				throw error;
			}
		}

		default:
			return null;
	}
}
