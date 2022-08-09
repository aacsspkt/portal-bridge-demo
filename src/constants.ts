import base58 from 'bs58';
import { getAddress } from 'ethers/lib/utils';

import {
  CHAIN_ID_ACALA,
  CHAIN_ID_AURORA,
  CHAIN_ID_AVAX,
  CHAIN_ID_BSC,
  CHAIN_ID_CELO,
  CHAIN_ID_ETH,
  CHAIN_ID_ETHEREUM_ROPSTEN,
  CHAIN_ID_FANTOM,
  CHAIN_ID_KARURA,
  CHAIN_ID_KLAYTN,
  CHAIN_ID_NEON,
  CHAIN_ID_OASIS,
  CHAIN_ID_POLYGON,
  CHAIN_ID_SOLANA,
  CHAIN_ID_TERRA,
  CHAIN_ID_TERRA2,
  ChainId,
  CONTRACTS,
} from '@certusone/wormhole-sdk';
import {
  clusterApiUrl,
  Keypair,
} from '@solana/web3.js';

export type Cluster = "devnet" | "testnet" | "mainnet";

export const CLUSTER: Cluster =
	process.env.REACT_APP_CLUSTER === "mainnet"
		? "mainnet"
		: process.env.REACT_APP_CLUSTER === "testnet"
		? "testnet"
		: "devnet";

export const KEYPAIR = Keypair.fromSecretKey(base58.decode(process.env.REACT_APP_WALLET_SECRET_KEY as string));

export const WORMHOLE_RPC_HOSTS =
	CLUSTER === "mainnet"
		? [
				"https://wormhole-v2-mainnet-api.certus.one",
				"https://wormhole.inotel.ro",
				"https://wormhole-v2-mainnet-api.mcf.rocks",
				"https://wormhole-v2-mainnet-api.chainlayer.network",
				"https://wormhole-v2-mainnet-api.staking.fund",
				"https://wormhole-v2-mainnet.01node.com",
		  ]
		: CLUSTER === "testnet"
		? ["https://wormhole-v2-testnet-api.certus.one"]
		: ["http://localhost:7071"];

export const ETH_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 1 : CLUSTER === "testnet" ? 5 : 1337;

export const ROPSTEN_ETH_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 1 : CLUSTER === "testnet" ? 3 : 1337;

export const BSC_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 56 : CLUSTER === "testnet" ? 97 : 1397;

export const POLYGON_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 137 : CLUSTER === "testnet" ? 80001 : 1381;

export const AVAX_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 43114 : CLUSTER === "testnet" ? 43113 : 1381;

export const OASIS_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 42262 : CLUSTER === "testnet" ? 42261 : 1381;

export const AURORA_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 1313161554 : CLUSTER === "testnet" ? 1313161555 : 1381;

export const FANTOM_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 250 : CLUSTER === "testnet" ? 4002 : 1381;

export const KARURA_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 686 : CLUSTER === "testnet" ? 596 : 1381;

export const ACALA_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 787 : CLUSTER === "testnet" ? 597 : 1381;

export const KLAYTN_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 8217 : CLUSTER === "testnet" ? 1001 : 1381;

export const CELO_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 42220 : CLUSTER === "testnet" ? 44787 : 1381;

export const NEON_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 245022934 : CLUSTER === "testnet" ? 245022926 : 1381;

export const getEvmChainId = (chainId: ChainId) =>
	chainId === CHAIN_ID_ETH
		? ETH_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_ETH_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_BSC
		? BSC_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_POLYGON
		? POLYGON_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_AVAX
		? AVAX_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_OASIS
		? OASIS_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_AURORA
		? AURORA_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_FANTOM
		? FANTOM_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_KARURA
		? KARURA_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_ACALA
		? ACALA_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_KLAYTN
		? KLAYTN_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_CELO
		? CELO_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_NEON
		? NEON_NETWORK_CHAIN_ID
		: undefined;

export const isSolanaChain = (chain: ChainId) => {
	return chain === CHAIN_ID_SOLANA;
};

export const SOLANA_HOST = process.env.REACT_APP_SOLANA_API_URL
	? process.env.REACT_APP_SOLANA_API_URL
	: CLUSTER === "mainnet"
	? clusterApiUrl("mainnet-beta")
	: CLUSTER === "testnet"
	? clusterApiUrl("devnet")
	: "http://localhost:8899";

export const ALGORAND_HOST =
	CLUSTER === "mainnet"
		? {
				algodToken: "",
				algodServer: "https://mainnet-api.algonode.cloud",
				algodPort: "",
		  }
		: CLUSTER === "testnet"
		? {
				algodToken: "",
				algodServer: "https://testnet-api.algonode.cloud",
				algodPort: "",
		  }
		: {
				algodToken: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
				algodServer: "http://localhost",
				algodPort: "4001",
		  };

export const KARURA_HOST =
	CLUSTER === "mainnet"
		? "https://eth-rpc-karura.aca-api.network/"
		: CLUSTER === "testnet"
		? "https://karura-dev.aca-dev.network/eth/http"
		: "";

export const ACALA_HOST =
	CLUSTER === "mainnet"
		? "https://eth-rpc-acala.aca-api.network/"
		: CLUSTER === "testnet"
		? "https://acala-dev.aca-dev.network/eth/http"
		: "";

export const ETH_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"
		: CLUSTER === "testnet"
		? "0x706abc4E45D419950511e474C7B9Ed348A4a716c"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const ETH_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x3ee18B2214AFF97000D974cf647E7C347E8fa585"
		: CLUSTER === "testnet"
		? "0xF890982f9310df57d00f659cf4fd87e65adEd8d7"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const BSC_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"
		: CLUSTER === "testnet"
		? "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const BSC_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7"
		: CLUSTER === "testnet"
		? "0x9dcF9D205C9De35334D646BeE44b2D2859712A09"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const POLYGON_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7"
		: CLUSTER === "testnet"
		? "0x0CBE91CF822c73C2315FB05100C2F714765d5c20"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const POLYGON_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE"
		: CLUSTER === "testnet"
		? "0x377D55a7928c046E18eEbb61977e714d2a76472a"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const AVAX_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c"
		: CLUSTER === "testnet"
		? "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const AVAX_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052"
		: CLUSTER === "testnet"
		? "0x61E44E506Ca5659E6c0bba9b678586fA2d729756"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const OASIS_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585"
		: CLUSTER === "testnet"
		? "0xc1C338397ffA53a2Eb12A7038b4eeb34791F8aCb"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const OASIS_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x5848C791e09901b40A9Ef749f2a6735b418d7564"
		: CLUSTER === "testnet"
		? "0x88d8004A9BdbfD9D28090A02010C19897a29605c"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const AURORA_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"
		: CLUSTER === "testnet"
		? "0xBd07292de7b505a4E803CEe286184f7Acf908F5e"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const AURORA_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F"
		: CLUSTER === "testnet"
		? "0xD05eD3ad637b890D68a854d607eEAF11aF456fba"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const FANTOM_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x126783A6Cb203a3E35344528B26ca3a0489a1485"
		: CLUSTER === "testnet"
		? "0x1BB3B4119b7BA9dfad76B0545fb3F531383c3bB7"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const FANTOM_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2"
		: CLUSTER === "testnet"
		? "0x599CEa2204B4FaECd584Ab1F2b6aCA137a0afbE8"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const KARURA_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"
		: CLUSTER === "testnet"
		? "0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const KARURA_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0xae9d7fe007b3327AA64A32824Aaac52C42a6E624"
		: CLUSTER === "testnet"
		? "0xd11De1f930eA1F7Dd0290Fe3a2e35b9C91AEFb37"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const ACALA_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? CONTRACTS.MAINNET.acala.core
		: CLUSTER === "testnet"
		? "0x4377B49d559c0a9466477195C6AdC3D433e265c0"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const ACALA_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? CONTRACTS.MAINNET.acala.token_bridge
		: CLUSTER === "testnet"
		? "0xebA00cbe08992EdD08ed7793E07ad6063c807004"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const KLAYTN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7"
		: CLUSTER === "testnet"
		? "0x1830CC6eE66c84D2F177B94D544967c774E624cA"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const KLAYTN_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F"
		: CLUSTER === "testnet"
		? "0xC7A13BE098720840dEa132D860fDfa030884b09A"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const CELO_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"
		: CLUSTER === "testnet"
		? "0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const CELO_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed"
		: CLUSTER === "testnet"
		? "0x05ca6037eC51F8b712eD2E6Fa72219FEaE74E153"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const NEON_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x0000000000000000000000000000000000000000"
		: CLUSTER === "testnet"
		? CONTRACTS.TESTNET.neon.core
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const NEON_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x0000000000000000000000000000000000000000"
		: CLUSTER === "testnet"
		? CONTRACTS.TESTNET.neon.token_bridge
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const SOL_BRIDGE_ADDRESS =
	CLUSTER === "mainnet"
		? "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"
		: CLUSTER === "testnet"
		? "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"
		: "Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o";

export const SOL_TOKEN_BRIDGE_ADDRESS =
	CLUSTER === "mainnet"
		? "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb"
		: CLUSTER === "testnet"
		? "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe"
		: "B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE";

export const ROPSTEN_ETH_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"
		: CLUSTER === "testnet"
		? "0x210c5F5e2AF958B4defFe715Dc621b7a3BA888c5"
		: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
);

export const ROPSTEN_ETH_TOKEN_BRIDGE_ADDRESS = getAddress(
	CLUSTER === "mainnet"
		? "0x3ee18B2214AFF97000D974cf647E7C347E8fa585"
		: CLUSTER === "testnet"
		? "0xF174F9A837536C449321df1Ca093Bb96948D5386"
		: "0x0290FB167208Af455bB137780163b7B7a9a10C16",
);

export const TERRA_BRIDGE_ADDRESS =
	CLUSTER === "mainnet"
		? "terra1dq03ugtd40zu9hcgdzrsq6z2z4hwhc9tqk2uy5"
		: CLUSTER === "testnet"
		? "terra1pd65m0q9tl3v8znnz5f5ltsfegyzah7g42cx5v"
		: "terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5";

export const TERRA_TOKEN_BRIDGE_ADDRESS =
	CLUSTER === "mainnet"
		? "terra10nmmwe8r3g99a9newtqa7a75xfgs2e8z87r2sf"
		: CLUSTER === "testnet"
		? "terra1pseddrv0yfsn76u4zxrjmtf45kdlmalswdv39a"
		: "terra10pyejy66429refv3g35g2t7am0was7ya7kz2a4";

export const TERRA2_BRIDGE_ADDRESS =
	CLUSTER === "mainnet"
		? CONTRACTS.MAINNET.terra2.core
		: CLUSTER === "testnet"
		? CONTRACTS.TESTNET.terra2.core
		: "terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au";

export const TERRA2_TOKEN_BRIDGE_ADDRESS =
	CLUSTER === "mainnet"
		? CONTRACTS.MAINNET.terra2.token_bridge
		: CLUSTER === "testnet"
		? CONTRACTS.TESTNET.terra2.token_bridge
		: "terra1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrquka9l6";

export const ALGORAND_BRIDGE_ID = BigInt(CLUSTER === "mainnet" ? "0" : CLUSTER === "testnet" ? "86525623" : "4");

export const ALGORAND_TOKEN_BRIDGE_ID = BigInt(CLUSTER === "mainnet" ? "0" : CLUSTER === "testnet" ? "86525641" : "6");

export const getBridgeAddressForChain = (chainId: ChainId) =>
	chainId === CHAIN_ID_SOLANA
		? SOL_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETH
		? ETH_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_BSC
		? BSC_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA
		? TERRA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA2
		? TERRA2_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_POLYGON
		? POLYGON_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_ETH_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AVAX
		? AVAX_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_OASIS
		? OASIS_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AURORA
		? AURORA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_FANTOM
		? FANTOM_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KARURA
		? KARURA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ACALA
		? ACALA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KLAYTN
		? KLAYTN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_CELO
		? CELO_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_NEON
		? NEON_BRIDGE_ADDRESS
		: "";

export const getTokenBridgeAddressForChain = (chainId: ChainId) =>
	chainId === CHAIN_ID_SOLANA
		? SOL_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETH
		? ETH_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_BSC
		? BSC_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA
		? TERRA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA2
		? TERRA2_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_POLYGON
		? POLYGON_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_ETH_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AVAX
		? AVAX_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_OASIS
		? OASIS_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AURORA
		? AURORA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_FANTOM
		? FANTOM_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KARURA
		? KARURA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ACALA
		? ACALA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KLAYTN
		? KLAYTN_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_CELO
		? CELO_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_NEON
		? NEON_TOKEN_BRIDGE_ADDRESS
		: "";

export const WETH_ADDRESS =
	CLUSTER === "mainnet"
		? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
		: CLUSTER === "testnet"
		? "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6"
		: "0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E";

export const WETH_DECIMALS = 18;

export const ROPSTEN_WETH_ADDRESS =
	CLUSTER === "mainnet"
		? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
		: CLUSTER === "testnet"
		? "0xc778417e063141139fce010982780140aa0cd5ab"
		: "0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E";

export const ROPSTEN_WETH_DECIMALS = 18;
export const WBNB_ADDRESS =
	CLUSTER === "mainnet"
		? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
		: CLUSTER === "testnet"
		? "0xae13d989dac2f0debff460ac112a837c89baa7cd"
		: "0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E";
export const WBNB_DECIMALS = 18;

export const WMATIC_ADDRESS =
	CLUSTER === "mainnet"
		? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
		: CLUSTER === "testnet"
		? "0x9c3c9283d3e44854697cd22d3faa240cfb032889"
		: "0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E";
export const WMATIC_DECIMALS = 18;

export const context2CssClass = {
	success: "bg-blue-600",
	error: "bg-red-600",
	info: "bg-gray-600",
	warning: "bg-orange-400",
	default: "bg-indigo-600",
	dark: "bg-white-600 font-gray-300",
};
export const COVALENT_ETHEREUM = 5; // Covalent only supports mainnet and Kovan
export const COVALENT_BSC = CLUSTER === "devnet" ? 56 : CHAIN_ID_BSC;
export const COVALENT_API_KEY = process.env.REACT_APP_COVALENT_API_KEY ? process.env.REACT_APP_COVALENT_API_KEY : "";

export const COVALENT_POLYGON = CLUSTER === "devnet" ? 137 : CHAIN_ID_POLYGON;
export const COVALENT_GET_TOKENS_URL = (
	chainId: ChainId,
	walletAddress: string,
	nft?: boolean,
	noNftMetadata?: boolean,
) => {
	const chainNum =
		chainId === CHAIN_ID_ETH || chainId === CHAIN_ID_ETHEREUM_ROPSTEN
			? COVALENT_ETHEREUM
			: chainId === CHAIN_ID_BSC
			? COVALENT_BSC
			: chainId === CHAIN_ID_POLYGON
			? COVALENT_POLYGON
			: "";
	// https://www.covalenthq.com/docs/api/#get-/v1/{chain_id}/address/{address}/balances_v2/
	return chainNum
		? `https://api.covalenthq.com/v1/${chainNum}/address/${walletAddress}/balances_v2/?key=${COVALENT_API_KEY}${
				nft ? "&nft=true" : ""
		  }${noNftMetadata ? "&no-nft-fetch=true" : ""}`
		: "";
};
export const getDefaultNativeCurrencyAddressEvm = (chainId: ChainId) => {
	return chainId === CHAIN_ID_ETH
		? WETH_ADDRESS
		: chainId === CHAIN_ID_BSC
		? WBNB_ADDRESS
		: chainId === CHAIN_ID_POLYGON
		? WMATIC_ADDRESS
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_WETH_ADDRESS
		: "";
};
export const BLOCKSCOUT_GET_TOKENS_URL = (chainId: ChainId, walletAddress: string) => {
	const baseUrl =
		chainId === CHAIN_ID_OASIS
			? CLUSTER === "mainnet"
				? "https://explorer.emerald.oasis.dev"
				: CLUSTER === "testnet"
				? "https://testnet.explorer.emerald.oasis.dev"
				: ""
			: chainId === CHAIN_ID_AURORA
			? CLUSTER === "mainnet"
				? "https://explorer.mainnet.aurora.dev"
				: CLUSTER === "testnet"
				? "https://explorer.testnet.aurora.dev"
				: ""
			: chainId === CHAIN_ID_ACALA
			? CLUSTER === "mainnet"
				? "https://blockscout.acala.network"
				: CLUSTER === "testnet"
				? "https://blockscout.acala-dev.aca-dev.network"
				: ""
			: chainId === CHAIN_ID_KARURA
			? CLUSTER === "mainnet"
				? "https://blockscout.karura.network"
				: CLUSTER === "testnet"
				? "https://blockscout.karura-dev.aca-dev.network"
				: ""
			: chainId === CHAIN_ID_CELO
			? CLUSTER === "mainnet"
				? "https://explorer.celo.org"
				: CLUSTER === "testnet"
				? "https://alfajores-blockscout.celo-testnet.org"
				: ""
			: "";
	return baseUrl ? `${baseUrl}/api?module=account&action=tokenlist&address=${walletAddress}` : "";
};

export const MAX_VAA_UPLOAD_RETRIES_SOLANA = 5;
