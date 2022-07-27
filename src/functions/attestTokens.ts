import { ethers } from "ethers";

import {
	attestFromEth,
	ChainName,
	getEmitterAddressEth,
	getSignedVAAWithRetry,
	parseSequenceFromLogEth,
} from "@certusone/wormhole-sdk";

import {
	BRIDGE_ADDRESS_TESTNET,
	TOKEN_BRIDGE_ADDRESS_TESTNET,
	WORMHOLE_REST_ADDRESS_TESTNET,
} from "../constants_testnet";

export * from "./createWrapped";

/**
 *
 * @param sourceChain Source Chain Id
 * @param signer Signer
 * @param tokenAddress Token address
 * @returns Vaa URL of contract receipt of the attestation
 */
export async function attestToken(sourceChain: ChainName, signer: ethers.Signer, tokenAddress: string) {
	switch (sourceChain) {
		case "ethereum":
			// const gasLimit: ethers.BigNumberish = 1000000;
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address;
			console.log("Attesting token");
			const tokenAttestation = await attestFromEth(tokenBridgeAddress, signer, tokenAddress);
			console.log("token attest txn hash:", tokenAttestation.transactionHash);
			const emitterAddress = getEmitterAddressEth(tokenBridgeAddress);
			console.log("fetching vaa");
			console.log("emitterAddress:", emitterAddress);
			const sequence = parseSequenceFromLogEth(tokenAttestation, BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address);
			console.log("sequence:", sequence);
			const { vaaBytes } = await getSignedVAAWithRetry(
				[WORMHOLE_REST_ADDRESS_TESTNET],
				sourceChain,
				emitterAddress,
				sequence,
			);
			console.log("vaa:", vaaBytes.toString());
			return vaaBytes;

		default:
			return null;
	}
}
