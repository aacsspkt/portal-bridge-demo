import { ethers } from 'ethers';

import {
  ChainId,
  ChainName,
  createWrappedOnEth,
  getEmitterAddressEth,
  getForeignAssetSolana,
  getSignedVAA,
  hexToUint8Array,
  parseSequenceFromLogEth,
  tryNativeToHexString,
} from '@certusone/wormhole-sdk';

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
	signer: ethers.Signer,
	tokenAddress: string,
	tokenAttestation: ethers.ContractReceipt,
) {
	switch (sourceChain) {
		case "ethereum":
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS["ethereum"].address;
			const emitterAddr = getEmitterAddressEth(tokenBridgeAddress);
			const seq = parseSequenceFromLogEth(tokenAttestation, BRIDGE_ADDRESS["ethereum"].address);
			const signedVAA = await getSignedVAA(
				WORMHOLE_REST_ADDRESS,
				TOKEN_BRIDGE_ADDRESS["ethereum"].wormholeChainId,
				emitterAddr,
				seq,
			);
			await createWrappedOnEth(tokenBridgeAddress, signer, signedVAA.vaaBytes);

			const wrappedTokenAddress = await getForeignAssetSolana(
				connection,
				SOLANA_TOKEN_BRIDGE_ADDRESS,
				sourceChainId,
				hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
			);

			console.log("Wrapped token created at: ", wrappedTokenAddress);
			return wrappedTokenAddress;

		default:
			break;
	}
}
