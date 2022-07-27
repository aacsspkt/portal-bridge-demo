import { ChainName, getForeignAssetSolana, hexToUint8Array, tryNativeToHexString } from "@certusone/wormhole-sdk";

import { CONNECTION_TESTNET as connection, TOKEN_BRIDGE_ADDRESS_TESTNET } from "../constants_testnet";

export async function deriveForeignToken(tokenAddress: string, sourceChain: ChainName, targetChain: ChainName) {
	switch (targetChain) {
		case "solana":
			return await getForeignAssetSolana(
				connection,
				TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
				sourceChain,
				hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
			);

		default:
			return null;
	}
}
