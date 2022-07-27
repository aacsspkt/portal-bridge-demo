import {
  ChainName,
  createPostVaaInstructionSolana,
  createWrappedOnSolana,
} from '@certusone/wormhole-sdk';
import {
  Keypair,
  PublicKey,
  SendTransactionError,
  Signer,
  Transaction,
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS_TESTNET,
  CONNECTION_TESTNET as connection,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
} from '../constants_testnet';
import { sendAndConfirmTransactions } from './sendTransactionSolana';

/**
 * @param sourceChain Source Chain Name
 * @param payerAddress Public Key of the fee payer
 * @param signer Signer who signs and pay
 * @param signedVAA Vaa obtained after attestation
 * @returns Array of transaction signature
 */
export async function createWrappedTokens(
	sourceChain: ChainName,
	payerAddress: PublicKey,
	signer: Signer,
	signedVAA: String,
) {
	switch (sourceChain) {
		case "ethereum": {
			//post vaa
			const postVaaTxn = new Transaction().add(
				await createPostVaaInstructionSolana(
					BRIDGE_ADDRESS_TESTNET["solana"].address,
					payerAddress.toString(),
					Buffer.from(signedVAA, "base64"),
					signer as Keypair,
				),
			);
			const createWrappedTxn = await createWrappedOnSolana(
				connection,
				BRIDGE_ADDRESS_TESTNET["solana"].address,
				TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
				payerAddress.toString(),
				Buffer.from(signedVAA, "base64"),
			);
			try {
				const txnIds = await sendAndConfirmTransactions(connection, [postVaaTxn, createWrappedTxn], signer);
				return txnIds;
			} catch (error) {
				if (error instanceof SendTransactionError) {
					console.log(error.logs);
				}
				throw error;
			}
		}

		default:
			throw new Error("Not implemented");
	}
}
