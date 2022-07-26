import { ethers } from 'ethers';

import {
  ChainId,
  ChainName,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getForeignAssetSolana,
  getSignedVAA,
  hexToUint8Array,
  parseSequenceFromLogEth,
  tryNativeToHexString,
} from '@certusone/wormhole-sdk';
import {
  PublicKey,
  Signer,
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS,
  CONNECTION as connection,
  SOLANA_TOKEN_BRIDGE_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_REST_ADDRESS,
} from '../constants';

/**
 * @param sourceChain Source Chain Name
 * @param sourceChainId Source Chain Id
 * @param signer Signer
 * @param tokenAddress Token address
 * @param tokenAttestation token attestation (from attestTokens.ts)
 * @returns wrapped token address in target chain
 */
export async function createWrapped(
	sourceChain: ChainName,
	sourceChainId: ChainId,
	payerAddress: PublicKey,
	signer: Signer,
	tokenAddress: string,
	tokenAttestation: ethers.ContractReceipt,
) {
	switch (sourceChain) {
		case "ethereum": {
			const emitterAddr = getEmitterAddressEth(TOKEN_BRIDGE_ADDRESS["ethereum"].address);
			const seq = parseSequenceFromLogEth(tokenAttestation, BRIDGE_ADDRESS["ethereum"].address);
			const signedVAA = await getSignedVAA(
				WORMHOLE_REST_ADDRESS,
				TOKEN_BRIDGE_ADDRESS["ethereum"].wormholeChainId,
				emitterAddr,
				seq,
			);

			const bridgeAddress = TOKEN_BRIDGE_ADDRESS["solana"].address;
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS["solana"].address;

			const txn = await createWrappedOnSolana(
				connection,
				bridgeAddress,
				tokenBridgeAddress,
				payerAddress.toString(),
				signedVAA.vaaBytes,
			);

			const lbh = await connection.getLatestBlockhash();
			txn.feePayer = new PublicKey(payerAddress);
			txn.recentBlockhash = lbh.blockhash;
			txn.lastValidBlockHeight = lbh.lastValidBlockHeight;

			const txnId = await connection.sendTransaction(txn, [signer], {
				preflightCommitment: "processed",
				skipPreflight: false,
			});

			await connection.confirmTransaction(
				{
					signature: txnId,
					blockhash: lbh.blockhash,
					lastValidBlockHeight: lbh.lastValidBlockHeight,
				},
				"confirmed",
			);

			const wrappedTokenAddress = await getForeignAssetSolana(
				connection,
				SOLANA_TOKEN_BRIDGE_ADDRESS,
				sourceChainId,
				hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
			);

			console.log("Wrapped token created at: ", wrappedTokenAddress);
			return wrappedTokenAddress;
		}

		default:
			break;
	}
}
