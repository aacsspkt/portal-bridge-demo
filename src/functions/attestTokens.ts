import { ethers } from 'ethers';

import {
  attestFromEth,
  ChainId,
  ChainName,
  getEmitterAddressEth,
  getSignedVAA,
  parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk';

import {
  BRIDGE_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_REST_ADDRESS,
} from '../constants';
import { createWrapped } from './createWrapped';

export * from "./createWrapped";

/**
 *
 * @param sourceChain Source Chain Id
 * @param signer Signer
 * @param tokenAddress Token address
 * @returns Vaa URL of contract receipt of the attestation
 */
export async function attestToken(sourceChain: ChainName, chainId:ChainId, signer: ethers.Signer, tokenAddress: string) {
	let tokenAttestation: ethers.ContractReceipt;
	switch (sourceChain) {
		case "ethereum":
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS["ethereum"].address;
			tokenAttestation = await attestFromEth(tokenBridgeAddress, signer, tokenAddress);
			const emitterAddr = getEmitterAddressEth(tokenBridgeAddress);
			const seq = parseSequenceFromLogEth(tokenAttestation, BRIDGE_ADDRESS["ethereum"].address);
			const signedVAA = await getSignedVAA(WORMHOLE_REST_ADDRESS, "ethereum", emitterAddr, seq);
			return createWrapped(sourceChain, chainId, signer, tokenAddress, tokenAttestation);

		default:
			break;
	}
}
