import { ChainId } from "@certusone/wormhole-sdk";

export type CHAIN_NAMES =
	| "solana"
	| "ethereum"
	| "terra"
	| "bsc"
	| "polygon"
	| "avalanche"
	| "oasis"
	| "aurora"
	| "fantom"
	| "karura"
	| "acala"
	| "klaytn"
	| "celo";

export type BridgeConfig = {
	wormholeChainId: ChainId;
	networkId: string | number;
	address: string;
};
