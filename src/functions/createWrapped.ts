import {
  ChainName,
  createPostVaaInstructionSolana,
  createWrappedOnSolana,
} from '@certusone/wormhole-sdk';
import { publicrpc } from '@certusone/wormhole-sdk-proto-web';
import {
  Keypair,
  PublicKey,
  Signer,
  Transaction,
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS,
  CONNECTION as connection,
  TOKEN_BRIDGE_ADDRESS,
} from '../constants';
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
	signedVAA: publicrpc.GetSignedVAAResponse,
) {
	switch (sourceChain) {
		case "ethereum": {
			//post vaa
			const postVaaTxn = new Transaction().add(
				await createPostVaaInstructionSolana(
					BRIDGE_ADDRESS["solana"].address,
					payerAddress.toString(),
					Buffer.from(signedVAA.vaaBytes),
					signer as Keypair,
				),
			);
			const createWrappedTxn = await createWrappedOnSolana(
				connection,
				BRIDGE_ADDRESS["solana"].address,
				TOKEN_BRIDGE_ADDRESS["solana"].address,
				payerAddress.toString(),
				signedVAA.vaaBytes,
			);
			const txnIds = await sendAndConfirmTransactions(connection, [postVaaTxn, createWrappedTxn], signer);
			return txnIds;
		}

		default:
			throw new Error("Not implemented");
	}
}
