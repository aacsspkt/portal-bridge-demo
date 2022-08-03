import { ethers } from 'ethers';

import {
  ChainName,
  getForeignAssetEth,
  getForeignAssetSolana,
  getIsWrappedAssetEth,
  getIsWrappedAssetSol,
  getOriginalAssetEth,
  getOriginalAssetSol,
  hexToUint8Array,
  tryNativeToHexString,
  tryUint8ArrayToNative,
} from '@certusone/wormhole-sdk';
import { Connection } from '@solana/web3.js';

import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
} from '../constants';
import {
  ArgumentNullOrUndefinedError,
  NotImplementedError,
} from '../errors';

export async function getCorrespondingToken(param: {
	tokenAddress: string;
	sourceChain: ChainName;
	targetChain: ChainName;
	signer?: ethers.Signer;
}) {
	const { tokenAddress, sourceChain, targetChain, signer } = param;
	console.log(tokenAddress, sourceChain, targetChain, signer);

	const isWrapped = await getIsWrapped({ tokenAddress, sourceChain, signer });
	if (isWrapped) {
		return await getOriginalAsset({ tokenAddress, sourceChain, targetChain, signer });
	} else {
		return await getForeignAsset({ tokenAddress, sourceChain, targetChain, provider: signer });
	}
}

export async function getForeignAsset(param: {
	tokenAddress: string;
	sourceChain: ChainName;
	targetChain: ChainName;
	provider?: ethers.Signer | ethers.providers.Provider;
}) {
	console.log("get foreign asset");
	const { tokenAddress, sourceChain, targetChain, provider } = param;
	switch (targetChain) {
		case "solana":
			try {
				const address = await getForeignAssetSolana(
					new Connection(SOLANA_HOST),
					SOL_BRIDGE_ADDRESS,
					sourceChain,
					hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
				);
				console.log("address", address);
				return address;
			} catch (e) {
				throw e;
			}

		case "ethereum":
			try {
				if (!provider) throw new ArgumentNullOrUndefinedError();
				return await getForeignAssetEth(
					ETH_BRIDGE_ADDRESS,
					provider,
					sourceChain,
					hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
				);
			} catch (e) {
				throw e;
			}

		default:
			throw new NotImplementedError();
	}
}

export async function getOriginalAsset(param: {
	tokenAddress: string;
	sourceChain: ChainName;
	targetChain?: ChainName;
	signer?: ethers.Signer;
}) {
	const { tokenAddress, sourceChain, targetChain, signer } = param;
	switch (sourceChain) {
		case "ethereum": {
			try {
				if (!targetChain || !signer) throw new ArgumentNullOrUndefinedError();
				let origin = await getOriginalAssetEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, tokenAddress, targetChain);
				return tryUint8ArrayToNative(origin.assetAddress, origin.chainId);
			} catch (e) {
				throw e;
			}
		}
		case "solana": {
			try {
				let origin = await getOriginalAssetSol(new Connection(SOLANA_HOST), SOL_TOKEN_BRIDGE_ADDRESS, tokenAddress);
				return tryUint8ArrayToNative(origin.assetAddress, origin.chainId);
			} catch (e) {
				throw e;
			}
		}

		default:
			throw new NotImplementedError();
	}
}

export async function getIsWrapped(param: { tokenAddress: string; sourceChain: ChainName; signer?: ethers.Signer }) {
	const { tokenAddress, sourceChain, signer } = param;
	switch (sourceChain) {
		case "ethereum": {
			if (!signer) throw new ArgumentNullOrUndefinedError();
			const is_wrapped = await getIsWrappedAssetEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, tokenAddress);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
		case "solana": {
			const is_wrapped = await getIsWrappedAssetSol(
				new Connection(SOLANA_HOST),
				SOL_TOKEN_BRIDGE_ADDRESS,
				tokenAddress,
			);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
		default:
			throw new NotImplementedError();
	}
}
