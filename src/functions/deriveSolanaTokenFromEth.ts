import { PublicKey } from "@solana/web3.js";
import {
	ChainId,
	getForeignAssetSolana,
	hexToUint8Array,
	toChainName,
	tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import { CONNECTION as connection, SOLANA_TOKEN_BRIDGE_ADDRESS } from "../constants";

export async function deriveCorrespondingToken(tokenAddress: string, sourceChainId: ChainId, targetChainId: ChainId) {
	switch (toChainName(targetChainId)) {
		case "solana":
			const str = await getForeignAssetSolana(
				connection,
				SOLANA_TOKEN_BRIDGE_ADDRESS,
				sourceChainId,
				hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChainId)),
			);
			return str !== null ? new PublicKey(str) : str;

		default:
			throw new Error("Not Implemented");
	}
}
