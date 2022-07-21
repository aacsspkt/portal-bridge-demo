import { PublicKey } from "@solana/web3.js";
import {
	ChainId,
	CHAIN_ID_ETH,
	getForeignAssetSolana,
	hexToUint8Array,
	tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import { CONNECTION as connection, SOLANA_TOKEN_BRIDGE_ADDRESS } from "../constants";

export async function deriveSolanaToken(tokenAddress: string, chainId: ChainId) {
	return new PublicKey(
		(await getForeignAssetSolana(
			connection,
			SOLANA_TOKEN_BRIDGE_ADDRESS,
			CHAIN_ID_ETH,
			hexToUint8Array(tryNativeToHexString(tokenAddress, chainId) || ""),
		)) || "",
	);
}
