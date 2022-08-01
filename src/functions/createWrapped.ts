import { ethers } from 'ethers';

import {
  ChainName,
  createWrappedOnSolana,
  postVaaSolanaWithRetry,
} from '@certusone/wormhole-sdk';
import {
  Keypair,
  SendTransactionError,
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS_TESTNET,
  CONNECTION_TESTNET as connection,
  RECIPIENT_WALLET_ADDRESS_TESTNET,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
} from '../constants_testnet';
import {
  sendAndConfirmTransactions,
  signTransaction,
} from '../utils/solana';

/**
 * @param payerAddress Public Key of the fee payer
 * @param targetChain Source Chain Name
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
				await sendAndConfirmTransactions(
					connection,
					signTransaction,
					[createWrappedTxn],
					RECIPIENT_WALLET_ADDRESS_TESTNET,
					10,
				);

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
