import { ethers } from "ethers";

import { ChainName, createPostVaaInstructionSolana, createWrappedOnSolana } from "@certusone/wormhole-sdk";
import { Keypair, SendTransactionError, Transaction } from "@solana/web3.js";

import {
	BRIDGE_ADDRESS_TESTNET,
	CONNECTION_TESTNET as connection,
	TOKEN_BRIDGE_ADDRESS_TESTNET,
} from "../constants_testnet";
import { sendAndConfirmTransactions } from "./sendTransactionSolana";

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
				//post vaa
				console.log("creating txn for posting vaa");
				const postVaaTxn = new Transaction().add(
					await createPostVaaInstructionSolana(bridgeAddress, payerAddress, Buffer.from(signedVAA), signer),
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
				console.log("init txn send.");
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
			return null;
	}
}
