import { ethers } from 'ethers';

import {
  ChainId,
  getIsWrappedAssetEth,
  getIsWrappedAssetSol,
  toChainName,
} from '@certusone/wormhole-sdk';

import { BRIDGE_ADDRESS_TESTNET, TOKEN_BRIDGE_ADDRESS_TESTNET } from '../constants_testnet';

import {Connection} from "@solana/web3.js";

export async function isWrapped(
	sourceChainId: ChainId, 
	signer: ethers.Signer, 
	tokenAddress: string, 
	connection?:Connection) {
	switch (toChainName(sourceChainId)) {
		case "ethereum": {
			const is_wrapped = getIsWrappedAssetEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address, 
				signer, 
				tokenAddress
				);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
		case "solana": {
			const is_wrapped = getIsWrappedAssetSol(
				connection as Connection, 
				BRIDGE_ADDRESS_TESTNET["solana"].address, 
				tokenAddress
				);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
		default:
			return null;
	}
}
