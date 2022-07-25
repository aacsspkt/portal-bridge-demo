import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { BridgeConfig, CHAIN_NAMES } from "./types";

export const RECIPIENT_WALLET_ADDRESS = new PublicKey("CSbNAhedp9JBjchyoPdBH4QWgmrncuhx6SwQxv4gdqhP");

export const SOLANA_TOKEN_BRIDGE_ADDRESS = "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb";
export const CONNECTION = new Connection(clusterApiUrl("mainnet-beta"));

export const WORMHOLE_REST_ADDRESS = "https://wormhole-v2-mainnet-api.certus.one";
export const WORMHOLE_REST_ADDRESS_TESTNET = "https://wormhole-v2-testnet-api.certus.one";

export const BRIDGE_ADDRESSES: {
	[chainName in CHAIN_NAMES]: BridgeConfig;
} = {
	solana: {
		wormholeChainId: 1,
		networkId: "mainnet-beta",
		address: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
	},
	ethereum: {
		wormholeChainId: 2,
		networkId: "1",
		address: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
	},
	terra: {
		wormholeChainId: 3,
		networkId: "columbus-5",
		address: "terra1dq03ugtd40zu9hcgdzrsq6z2z4hwhc9tqk2uy5",
	},
	bsc: {
		wormholeChainId: 4,
		networkId: 56,
		address: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
	},
	polygon: {
		wormholeChainId: 5,
		networkId: 137,
		address: "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7",
	},
	avalanche: {
		wormholeChainId: 6,
		networkId: 43114,
		address: "0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c",
	},
	oasis: {
		wormholeChainId: 7,
		networkId: 4262,
		address: "0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585",
	},
	aurora: {
		wormholeChainId: 9,
		networkId: 1313161554,
		address: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
	},
	fantom: {
		wormholeChainId: 10,
		networkId: 250,
		address: "0x126783A6Cb203a3E35344528B26ca3a0489a1485",
	},
	karura: {
		wormholeChainId: 11,
		networkId: 686,
		address: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
	},
	acala: {
		wormholeChainId: 12,
		networkId: 787,
		address: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
	},
	klaytn: {
		wormholeChainId: 13,
		networkId: 8217,
		address: "0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7",
	},
	celo: {
		wormholeChainId: 14,
		networkId: 42220,
		address: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
	},
};

export const TOKEN_BRIDGE_ADDRESS: {
	[chainName in CHAIN_NAMES]: BridgeConfig;
} = {
	solana: {
		wormholeChainId: 1,
		networkId: "mainnet-beta",
		address: "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb",
	},
	ethereum: {
		wormholeChainId: 2,
		networkId: 1,
		address: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
	},
	terra: {
		wormholeChainId: 3,
		networkId: "columbus-5",
		address: "terra10nmmwe8r3g99a9newtqa7a75xfgs2e8z87r2sf",
	},
	bsc: {
		wormholeChainId: 4,
		networkId: 56,
		address: "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7",
	},
	polygon: {
		wormholeChainId: 5,
		networkId: 137,
		address: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
	},
	avalanche: {
		wormholeChainId: 6,
		networkId: 43114,
		address: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
	},
	oasis: {
		wormholeChainId: 7,
		networkId: 4262,
		address: "0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585",
	},
	aurora: {
		wormholeChainId: 9,
		networkId: 1313161554,
		address: "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F",
	},
	fantom: {
		wormholeChainId: 10,
		networkId: 250,
		address: "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
	},
	karura: {
		wormholeChainId: 11,
		networkId: 686,
		address: "0xae9d7fe007b3327AA64A32824Aaac52C42a6E624",
	},
	acala: {
		wormholeChainId: 12,
		networkId: 787,
		address: "0xae9d7fe007b3327AA64A32824Aaac52C42a6E624",
	},
	klaytn: {
		wormholeChainId: 13,
		networkId: 8217,
		address: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
	},
	celo: {
		wormholeChainId: 14,
		networkId: 42220,
		address: "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed",
	},
};
