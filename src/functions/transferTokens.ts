import { BigNumberish, Signer } from "ethers";

import {
	approveEth,
	ChainName,
	getEmitterAddressEth,
	getSignedVAA,
	parseSequenceFromLogEth,
	transferFromEth,
} from "@certusone/wormhole-sdk";

import {
	BRIDGE_ADDRESS_TESTNET,
	TOKEN_BRIDGE_ADDRESS_TESTNET,
	WORMHOLE_REST_ADDRESS_TESTNET,
} from "../constants_testnet";

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
			// const approve_receipt= await approveEth( BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address, tokenAddress, signer, amount);
			// console.log("approve ETh", approve_receipt)
			const transfer_receipt = await transferFromEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
				signer,
				tokenAddress,
				amount,
				"solana",
				recipientAddress,
				relayerFee
			);
			console.log("receipt", transfer_receipt);
			console.log("Are you here?");
			const seq = parseSequenceFromLogEth(transfer_receipt, BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address);
			const emitterAddress = getEmitterAddressEth(TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address);
			const signedVAA = await getSignedVAA(WORMHOLE_REST_ADDRESS_TESTNET, "ethereum", emitterAddress, seq);
			return signedVAA;

		default:
			throw new Error("Not Implemented");
	}
}
