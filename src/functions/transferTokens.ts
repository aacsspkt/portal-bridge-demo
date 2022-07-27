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
  BRIDGE_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_REST_ADDRESS,
  WORMHOLE_REST_ADDRESS_TESTNET,
} from '../constants';
import { BRIDGE_ADDRESS_TESTNET, TOKEN_BRIDGE_ADDRESS_TESTNET } from '../constants_testnet';

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
			console.log(tokenAddress);
			const receipt = await transferFromEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum"].address,
				signer,
				tokenAddress,
				amount,
				"solana",
				recipientAddress,
				relayerFee,
			);
			console.log("receipt",receipt)
			console.log("Are you here?")
			const seq = parseSequenceFromLogEth(receipt, BRIDGE_ADDRESS_TESTNET["ethereum"].address);
			const emitterAddress = getEmitterAddressEth(TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum"].address);
			const signedVAA = await getSignedVAA(WORMHOLE_REST_ADDRESS_TESTNET, "ethereum", emitterAddress, seq);
			return signedVAA;

		default:
			throw new Error("Not Implemented");
	}
}
