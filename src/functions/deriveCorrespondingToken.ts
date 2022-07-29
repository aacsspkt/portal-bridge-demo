import { ethers } from 'ethers';

import {
  ChainName,
  getForeignAssetSolana,
  getOriginalAssetEth,
  getOriginalAssetSol,
  hexToUint8Array,
  tryNativeToHexString,
} from '@certusone/wormhole-sdk';
import { Signer } from '@solana/web3.js';

import {
  CONNECTION_TESTNET as connection,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
} from '../constants_testnet';

export async function getForeignAsset(tokenAddress: string, sourceChain: ChainName, targetChain: ChainName) {
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

export async function getOriginalAsset(
	sourceChain: ChainName,
	signer: Signer | ethers.Signer,
	wrappedTokenAddress?: string,
	mintAddress?: string,
) {
	console.log("Getting Original Asset Address!!");
	switch (sourceChain) {
		case "ethereum": {
			let origin = await getOriginalAssetEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
				signer as ethers.Signer,
				wrappedTokenAddress as string,
				"solana",
			);
			return origin.assetAddress;
		}
		case "solana": {
			let origin = await getOriginalAssetSol(
				connection,
				TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
				mintAddress as string,
			);
			return origin.assetAddress;
		}
		default:
			return null;
	}
}
