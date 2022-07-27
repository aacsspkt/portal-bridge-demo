import { Connection, Signer, Transaction } from "@solana/web3.js";

export async function sendAndConfirmTransactions(connection: Connection, transactions: Transaction[], signer: Signer) {
	try {
		let txnIds = await Promise.all(
			transactions.map(async (txn, i) => {
				const lbh = await connection.getLatestBlockhash();

				txn.feePayer = signer.publicKey;
				txn.recentBlockhash = lbh.blockhash;
				txn.lastValidBlockHeight = lbh.lastValidBlockHeight;
				txn.sign(signer);
				console.log("txn-" + i + " info:");
				console.log("txn fee payer:", txn.feePayer.toString());
				console.log(
					"txn signature:",
					txn.signatures.map((pair) => {
						return {
							publicKey: pair.publicKey.toString(),
							signature: pair.signature?.toString(),
						};
					}),
				);
				console.log(
					"txn intruction:",
					txn.instructions.map((ixn) => {
						return {
							data: ixn.data.toString(),
							programId: ixn.programId.toString(),
							keys: ixn.keys.map((account) => {
								return {
									pubkey: account.pubkey.toString(),
									isSigner: account.isSigner,
									isWritable: account.isWritable,
								};
							}),
						};
					}),
				);
				console.log("sending txn");
				const txnId = await connection.sendRawTransaction(txn.serialize(), {
					skipPreflight: false,
					preflightCommitment: "processed",
				});

				await connection.confirmTransaction(
					{
						signature: txnId,
						blockhash: lbh.blockhash,
						lastValidBlockHeight: lbh.lastValidBlockHeight,
					},
					"confirmed",
				);
				return txnId;
			}),
		);
		return txnIds;
	} catch (error) {
		throw error;
	}
}
