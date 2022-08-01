import nacl from 'tweetnacl';

import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import { KEYPAIR } from '../constants';

function logTransaction(transaction: Transaction) {
	console.log("blockHash", transaction.recentBlockhash);
	console.log("feePayer", transaction.feePayer?.toString());
	console.log(
		"instructions",
		transaction.instructions.map((ixn) => {
			return {
				// data: ixn.data.toJSON(),
				// programId: ixn.programId.toString(),
				keys: ixn.keys
					// .filter((key) => key.isSigner)
					.map((key) => {
						return {
							pubkey: key.pubkey.toString(),
							isSigner: key.isSigner,
							isWritable: key.isWritable,
						};
					}),
			};
		}),
	);
	console.log(
		"signatures",
		transaction.signatures.map((pair) => {
			return {
				publicKey: pair.publicKey.toString(),
				signature: pair.signature,
			};
		}),
	);
	transaction.signatures.forEach((pair, i) => {
		if (pair.signature) {
			console.log(
				"verfying signature" + i,
				nacl.sign.detached.verify(transaction.serializeMessage(), pair.signature, pair.publicKey.toBytes()),
			);
		}
	});
}

export const signTransaction = async (transaction: Transaction) => {
	// const existingPair = transaction.signatures.filter((pair) => pair.signature !== null);
	transaction.partialSign(KEYPAIR);
	// existingPair.forEach((pair) => {
	// 	if (pair.signature) transaction.addSignature(pair.publicKey, pair.signature);
	// });
	return transaction;
};

export async function sendAndConfirmTransactions(
	connection: Connection,
	signTransaction: (transaction: Transaction) => Promise<Transaction>,
	unsignedTransactions: Transaction[],
	payer: PublicKey,
	maxRetries: number = 0,
): Promise<string[]> {
	if (!(unsignedTransactions && unsignedTransactions.length)) {
		return Promise.reject("No transactions provided to send.");
	}
	let currentRetries = 0;
	let currentIndex = 0;
	const transactionReceipts = [];
	while (!(currentIndex >= unsignedTransactions.length) && !(currentRetries > maxRetries)) {
		let transaction = unsignedTransactions[currentIndex];
		let signed: Transaction;

		try {
			signed = await signTransaction(transaction);
		} catch (e) {
			//Eject here because this is most likely an intentional rejection from the user, or a genuine unrecoverable failure.
			return Promise.reject("Failed to sign transaction.");
		}

		try {
			logTransaction(signed);
			const txid = await connection.sendRawTransaction(signed.serialize());
			const receipt = await connection.confirmTransaction(txid);
			transactionReceipts.push(txid);
			currentIndex++;
		} catch (e: any) {
			console.log(e.logs ? e.logs : e);
			currentRetries++;
		}
	}

	if (currentRetries > maxRetries) {
		return Promise.reject("Reached the maximum number of retries.");
	} else {
		return Promise.resolve(transactionReceipts);
	}
}
