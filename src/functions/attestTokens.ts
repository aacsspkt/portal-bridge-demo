import { ethers } from 'ethers';

import {
  attestFromEth,
  ChainName,
  getEmitterAddressEth,
  getSignedVAA,
  parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk';

import {
  BRIDGE_ADDRESSES,
  TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_REST_ADDRESS,
} from '../constants';

/**
 *
 * @param sourceChain Source Chain Id
 * @param signer Signer
 * @param tokenAddress Token address
 * @returns Vaa URL of contract receipt of the attestation
 */
export async function attestToken(sourceChain: ChainName, signer: ethers.Signer, tokenAddress: string) {
	let tokenAttestation: ethers.ContractReceipt;
	switch (sourceChain) {
		case "ethereum":
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS["ethereum"].address;
			tokenAttestation = await attestFromEth(tokenBridgeAddress, signer, tokenAddress);
			const emitterAddr = getEmitterAddressEth(tokenBridgeAddress);
			const seq = parseSequenceFromLogEth(tokenAttestation, BRIDGE_ADDRESSES["ethereum"].address);
			const signedVAA = await getSignedVAA(WORMHOLE_REST_ADDRESS, "ethereum", emitterAddr, seq);
			return signedVAA;

		default:
			break;
	}
}
