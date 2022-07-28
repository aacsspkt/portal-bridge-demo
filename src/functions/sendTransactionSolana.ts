import {
  Connection,
  PublicKey,
  Signer,
  Transaction,
} from '@solana/web3.js';

import { KEYPAIR } from '../constants';

export const signTransaction = async (transaction: Transaction) => {
	const existingPair = transaction.signatures.filter((pair) => pair.signature !== null);
	transaction.sign(KEYPAIR);
	existingPair.forEach((pair) => {
		if (pair.signature) transaction.addSignature(pair.publicKey, pair.signature);
	});
	return transaction;
};

export async function sendAndConfirmTransactions(
	connection: Connection,
	unsignedTransactions: Transaction[],
	payer: PublicKey,
	signers: Signer[],
	maxRetries: number = 0,
) {
	if (!(unsignedTransactions && unsignedTransactions.length)) {
		return Promise.reject("No transactions provided to send.");
	}
	let currentRetries = 0;
	let currentIndex = 0;
	const transactionReceipts = [];
	while (!(currentIndex >= unsignedTransactions.length) && !(currentRetries > maxRetries)) {
		let transaction = unsignedTransactions[currentIndex];
		try {
			const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
			transaction.recentBlockhash = blockhash;
			transaction.lastValidBlockHeight = lastValidBlockHeight;
			transaction.feePayer = payer;
			try {
				const txid = await connection.sendTransaction(transaction, signers);
				const receipt = await connection.confirmTransaction({
					signature: txid,
					blockhash,
					lastValidBlockHeight,
				});
				transactionReceipts.push(receipt);
				currentIndex++;
			} catch (e) {
				throw e;
			}
		} catch (e) {
			console.error(e);
			currentRetries++;
			continue;
		}
	}

	if (currentRetries > maxRetries) {
		return Promise.reject("Reached the maximum number of retries.");
	} else {
		return Promise.resolve(transactionReceipts);
	}
}
