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

export type CHAIN_NAMES_TESTNET =
	| "solana"
	| "ethereum_goerli"
	| "ethereum_ropsten"
	| "terra"
	| "bsc"
	| "polygon"
	| "avalanche"
	| "oasis"
	| "algorand"
	| "aurora"
	| "fantom"
	| "karura"
	| "acala"
	| "klaytn"
	| "celo";

export type BridgeConfig = {
	wormholeChainId: ChainId;
	networkId: string | number | undefined;
	address: string;
};
