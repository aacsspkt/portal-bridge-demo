import {
  Connection,
  Signer,
  Transaction,
} from '@solana/web3.js';

export async function sendAndConfirmTransactions(connection: Connection, transactions: Transaction[], signer: Signer) {
	try {
		let txnIds = await Promise.all(
			transactions.map(async (txn, i) => {
				const lbh = await connection.getLatestBlockhash();

				txn.feePayer = signer.publicKey;
				txn.recentBlockhash = lbh.blockhash;
				txn.lastValidBlockHeight = lbh.lastValidBlockHeight;

				const txnId = await connection.sendTransaction(txn, [signer], {
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
