import { ethers } from 'ethers';

import {
  ChainName,
  createWrappedOnSolana,
  postVaaSolanaWithRetry,
} from '@certusone/wormhole-sdk';
import {
  Keypair,
  SendTransactionError,
  Transaction,
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS_TESTNET,
  CONNECTION_TESTNET as connection,
  RECIPIENT_WALLET_ADDRESS_TESTNET,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
} from '../constants_testnet';
import { sendAndConfirmTransactions } from '../utils/solana';

/**
 * @param sourceChain Source Chain Name
 * @param payerAddress Public Key of the fee payer
 * @param signer Signer who signs and pay
 * @param signedVAA Vaa obtained after attestation
 * @returns Array of transaction signature
 */
export async function createWrappedTokens(
	targetChain: ChainName,
	payerAddress: string,
	signer: Keypair | ethers.Signer,
	signedVAA: Uint8Array,
) {
	switch (targetChain) {
		case "solana": {
			try {
				if (!(signer instanceof Keypair)) throw new Error(`Signer should be instanceof Keypair. value: ${signer}`);
				const bridgeAddress = BRIDGE_ADDRESS_TESTNET["solana"].address;
				const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address;
				const signTransaction = async (transaction: Transaction) => {
					const existingPair = transaction.signatures.filter((pair) => pair.signature !== null);
					transaction.sign(signer);
					existingPair.forEach((pair) => {
						if (pair.signature) transaction.addSignature(pair.publicKey, pair.signature);
					});
					return transaction;
				};

				//post vaa
				console.log("posting vaa to solana");
				await postVaaSolanaWithRetry(
					connection,
					signTransaction,
					bridgeAddress,
					RECIPIENT_WALLET_ADDRESS_TESTNET.toString(),
					Buffer.from(signedVAA),
					10,
				);

				console.log("creating txn to create wrapped token");
				// create wrapped tokens
				const createWrappedTxn = await createWrappedOnSolana(
					connection,
					bridgeAddress,
					tokenBridgeAddress,
					payerAddress,
					signedVAA,
				);
				await sendAndConfirmTransactions(connection, [createWrappedTxn], RECIPIENT_WALLET_ADDRESS_TESTNET, [signer]);

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
