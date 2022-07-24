import { attestFromEth, ChainName, getEmitterAddressEth, parseSequenceFromLogEth } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { BRIDGE_ADDRESSES, TOKEN_BRIDGE_ADDRESS, WORMHOLE_REST_ADDRESS } from "../constants";
import { createVaaURL } from "./createVaaUrl";

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
			return createVaaURL(
				WORMHOLE_REST_ADDRESS,
				TOKEN_BRIDGE_ADDRESS["ethereum"].wormholeChainId.toString(),
				emitterAddr,
				seq,
			);

		default:
			break;
	}
}
