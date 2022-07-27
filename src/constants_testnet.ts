import {
  clusterApiUrl,
  Connection,
  PublicKey,
} from '@solana/web3.js';

import {
  BridgeConfig,
  CHAIN_NAMES,
} from './types';

export const RECIPIENT_WALLET_ADDRESS_TESTNET = new PublicKey("CSbNAhedp9JBjchyoPdBH4QWgmrncuhx6SwQxv4gdqhP");

export const CONNECTION_TESTNET = new Connection(clusterApiUrl("devnet"));

export const WORMHOLE_REST_ADDRESS_TESTNET = "https://wormhole-v2-testnet-api.certus.one";

export const WORMHOLE_GUARDIAN_PUBKEY = "0x13947Bd48b18E53fdAeEe77F3473391aC727C638";

export const BRIDGE_ADDRESS_TESTNET: {
	[chainName in CHAIN_NAMES]: BridgeConfig;
} = {
	solana: {
		wormholeChainId: 1,
		networkId: "devnet",
		address: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
	},
	ethereum: {
		wormholeChainId: 2,
		networkId: 5,
		address: "0x706abc4E45D419950511e474C7B9Ed348A4a716c",
	},
	terra: {
		wormholeChainId: 3,
		networkId: "bombay-12",
		address: "terra1pd65m0q9tl3v8znnz5f5ltsfegyzah7g42cx5v",
	},
	bsc: {
		wormholeChainId: 4,
		networkId: 97,
		address: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
	},
	polygon: {
		wormholeChainId: 5,
		networkId: 80001,
		address: "0x0CBE91CF822c73C2315FB05100C2F714765d5c20",
	},
	avalanche: {
		wormholeChainId: 6,
		networkId: 43113,
		address: "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
	},
	oasis: {
		wormholeChainId: 7,
		networkId: 42261,
		address: "0xc1C338397ffA53a2Eb12A7038b4eeb34791F8aCb",
	},
	aurora: {
		wormholeChainId: 9,
		networkId: 1313161555,
		address: "0xBd07292de7b505a4E803CEe286184f7Acf908F5e",
	},
	fantom: {
		wormholeChainId: 10,
		networkId: 4002,
		address: "0x1BB3B4119b7BA9dfad76B0545fb3F531383c3bB7",
	},
	karura: {
		wormholeChainId: 11,
		networkId: 686,
		address: "0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03",
	},
	acala: {
		wormholeChainId: 12,
		networkId: 787,
		address: "0x4377B49d559c0a9466477195C6AdC3D433e265c0",
	},
	klaytn: {
		wormholeChainId: 13,
		networkId: 1001,
		address: "0x1830CC6eE66c84D2F177B94D544967c774E624cA",
	},
	celo: {
		wormholeChainId: 14,
		networkId: 44787,
		address: "0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56",
	},
};

export const TOKEN_BRIDGE_ADDRESS_TESTNET: {
	[chainName in CHAIN_NAMES]: BridgeConfig;
} = {
	solana: {
		wormholeChainId: 1,
		networkId: "devnet",
		address: "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe",
	},
	ethereum: {
		wormholeChainId: 2,
		networkId: 5,
		address: "0xF890982f9310df57d00f659cf4fd87e65adEd8d7",
	},
	terra: {
		wormholeChainId: 3,
		networkId: "bombay-12",
		address: "terra1pseddrv0yfsn76u4zxrjmtf45kdlmalswdv39a",
	},
	bsc: {
		wormholeChainId: 4,
		networkId: 97,
		address: "0x9dcF9D205C9De35334D646BeE44b2D2859712A09",
	},
	polygon: {
		wormholeChainId: 5,
		networkId: 80001,
		address: "0x377D55a7928c046E18eEbb61977e714d2a76472a",
	},
	avalanche: {
		wormholeChainId: 6,
		networkId: 43113,
		address: "0x61E44E506Ca5659E6c0bba9b678586fA2d729756",
	},
	oasis: {
		wormholeChainId: 7,
		networkId: 42261,
		address: "0x88d8004A9BdbfD9D28090A02010C19897a29605c",
	},
	aurora: {
		wormholeChainId: 9,
		networkId: 1313161555,
		address: "0xD05eD3ad637b890D68a854d607eEAF11aF456fba",
	},
	fantom: {
		wormholeChainId: 10,
		networkId: 4002,
		address: "0x599CEa2204B4FaECd584Ab1F2b6aCA137a0afbE8",
	},
	karura: {
		wormholeChainId: 11,
		networkId: 686,
		address: "0xd11De1f930eA1F7Dd0290Fe3a2e35b9C91AEFb37",
	},
	acala: {
		wormholeChainId: 12,
		networkId: 787,
		address: "0xebA00cbe08992EdD08ed7793E07ad6063c807004",
	},
	klaytn: {
		wormholeChainId: 13,
		networkId: 1001,
		address: "0xC7A13BE098720840dEa132D860fDfa030884b09A",
	},
	celo: {
		wormholeChainId: 14,
		networkId: 44787,
		address: "0x05ca6037eC51F8b712eD2E6Fa72219FEaE74E153",
	},
};
