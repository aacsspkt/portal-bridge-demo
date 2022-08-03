import { ethers } from 'ethers';

import {
  attestFromEth,
  ChainName,
  getEmitterAddressEth,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk';

import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from '../constants';

export async function attestToken(sourceChain: ChainName, signer: ethers.Signer, tokenAddress: string) {
	switch (sourceChain) {
		case "ethereum":
			// const gasLimit: ethers.BigNumberish = 1000000;
			console.log("Attesting token");
			const tokenAttestation = await attestFromEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, tokenAddress);
			console.log("token attest txn hash:", tokenAttestation.transactionHash);
			const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
			console.log("fetching vaa");
			console.log("emitterAddress:", emitterAddress);
			const sequence = parseSequenceFromLogEth(tokenAttestation, ETH_BRIDGE_ADDRESS);
			console.log("sequence:", sequence);
			const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, sourceChain, emitterAddress, sequence);
			console.log("vaa:", vaaBytes.toString());
			return vaaBytes;

		default:
			return null;
	}
}
