import {
  BigNumberish,
  Signer,
} from 'ethers';

import {
  ChainName,
  getEmitterAddressEth,
  getSignedVAA,
  parseSequenceFromLogEth,
  transferFromEth,
} from '@certusone/wormhole-sdk';

import {
  BRIDGE_ADDRESSES,
  TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_REST_ADDRESS,
} from '../constants';

export async function transferTokens(
	sourceChain: ChainName,
	signer: Signer,
	tokenAddress: string,
	amount: BigNumberish,
	recipientAddress: Uint8Array,
	relayerFee?: BigNumberish,
) {
	switch (sourceChain) {
		case "ethereum":
			const receipt = await transferFromEth(
				TOKEN_BRIDGE_ADDRESS["ethereum"].address,
				signer,
				tokenAddress,
				amount,
				"solana",
				recipientAddress,
				relayerFee,
			);
			const seq = parseSequenceFromLogEth(receipt, BRIDGE_ADDRESSES["ethereum"].address);
			const emitterAddress = getEmitterAddressEth(TOKEN_BRIDGE_ADDRESS["ethereum"].address);
			const signedVAA = await getSignedVAA(WORMHOLE_REST_ADDRESS, "ethereum", emitterAddress, seq);
			return signedVAA;

		default:
			break;
	}
}
