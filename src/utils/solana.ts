import nacl from 'tweetnacl';

import {
  Connection,
  SendTransactionError,
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
	transaction.partialSign(KEYPAIR);
	return transaction;
};

export async function sendAndConfirmTransaction(
	connection: Connection,
	signTransaction: (transaction: Transaction) => Promise<Transaction>,
	transaction: Transaction,
	maxRetries: number = 0,
): Promise<string> {
	let currentRetries = 0;
	let success = false;
	let transactionReceipt: string = "";
	while (!success && !(currentRetries > maxRetries)) {
		let signed: Transaction;
		try {
			signed = await signTransaction(transaction);
			console.log("signed", signed);
		} catch (e) {
			//Eject here because this is most likely an intentional rejection from the user, or a genuine unrecoverable failure.
			return Promise.reject("Failed to sign transaction.");
		}
		try {
			logTransaction(signed);
			const txid = await connection.sendRawTransaction(signed.serialize());
			await connection.confirmTransaction(txid);
			transactionReceipt = txid;
			success = true;
		} catch (e) {
			console.log("error occured");
			console.log(e instanceof SendTransactionError ? e.logs : e);
			currentRetries++;
		}
	}

	if (currentRetries > maxRetries) {
		return Promise.reject("Reached the maximum number of retries.");
	} else {
		return Promise.resolve(transactionReceipt);
	}
}
