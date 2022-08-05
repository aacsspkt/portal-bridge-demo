import { ethers } from 'ethers';

import {
  ChainId,
  ChainName,
  getForeignAssetEth,
  getForeignAssetSolana,
  getIsWrappedAssetEth,
  getIsWrappedAssetSol,
  getOriginalAssetEth,
  getOriginalAssetSol,
  hexToUint8Array,
  tryNativeToHexString,
  tryNativeToUint8Array,
  tryUint8ArrayToNative,
} from '@certusone/wormhole-sdk';
import { Connection } from '@solana/web3.js';

import {
  setSourceWormholeWrappedInfo,
  setTargetAsset,
} from '../app/slices/transferSlice';
import { AppDispatch } from '../app/store';
import {
  ETH_TOKEN_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
} from '../constants';
import {
  ArgumentNullOrUndefinedError,
  NotImplementedError,
} from '../errors';

export type ForeignAssetInfo = {
	doesExist: boolean;
	address: string | null;
};

export interface StateSafeWormholeWrappedInfo {
	isWrapped: boolean;
	chainId: ChainId;
	assetAddress: string;
	tokenId?: string;
}

export async function getCorrespondingToken(param: {
	dispatch: AppDispatch;
	tokenAddress: string;
	sourceChain: ChainName;
	targetChain: ChainName;
	signer?: ethers.Signer;
}) {
	const { dispatch, tokenAddress, sourceChain, targetChain, signer } = param;
	console.log(tokenAddress, sourceChain, targetChain, signer);

	const isWrapped = await getIsWrapped({ tokenAddress, sourceChain, signer });
	console.log(isWrapped)
	if (isWrapped) {
		return await getOriginalAsset({ dispatch, tokenAddress, sourceChain, targetChain, signer });
	} else {
		return await getForeignAsset({ dispatch, tokenAddress, sourceChain, targetChain, provider: signer });
	}
}

export async function getForeignAsset(param: {
	dispatch: AppDispatch;
	tokenAddress: string;
	sourceChain: ChainName;
	targetChain: ChainName;
	provider?: ethers.Signer | ethers.providers.Provider;
}): Promise<string | null> {
	console.log("get foreign asset");
	const { dispatch, tokenAddress, sourceChain, targetChain, provider } = param;
	let address: string | null = null;
	switch (targetChain) {
		case "solana":
			try {
				console.log(SOLANA_HOST);
				address = await getForeignAssetSolana(
					new Connection(SOLANA_HOST),
					SOL_TOKEN_BRIDGE_ADDRESS,
					sourceChain,
					tryNativeToUint8Array(tokenAddress, sourceChain),
				);
				console.log(address);

				dispatch(
					setTargetAsset({
						doesExist: !!address,
						address: address,
					}),
				);
				console.log("address", address);
				break;
			} catch (e) {
				throw e;
			}

		case "ethereum":
			try {
				if (!provider) throw new ArgumentNullOrUndefinedError();
				address = await getForeignAssetEth(
					ETH_TOKEN_BRIDGE_ADDRESS,
					provider,
					sourceChain,
					hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
				);
				console.log("address", address);
				dispatch(
					setTargetAsset({
						doesExist: !!address,
						address: address,
					}),
				);
				break;
			} catch (e) {
				throw e;
			}

		default:
			throw new NotImplementedError();
	}
	return address;
}

export async function getOriginalAsset(param: {
	dispatch: AppDispatch;
	tokenAddress: string;
	sourceChain: ChainName;
	targetChain?: ChainName;
	signer?: ethers.Signer;
}): Promise<string | null> {
	const { dispatch, tokenAddress, sourceChain, targetChain, signer } = param;
	let address: string | null = null;
	switch (sourceChain) {
		case "ethereum": {
			try {
				if (!targetChain || !signer) throw new ArgumentNullOrUndefinedError();
				let origin = await getOriginalAssetEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, tokenAddress, targetChain);
				address = tryUint8ArrayToNative(origin.assetAddress, origin.chainId);
				console.log("address", address);
				dispatch(
					setTargetAsset({
						doesExist: !!address,
						address: address,
					}),
				);
				if (address) {
					dispatch(
						setSourceWormholeWrappedInfo({
							assetAddress: address,
							chainId: origin.chainId,
							isWrapped: origin.isWrapped,
						}),
					);
				}
				break;
			} catch (e) {
				throw e;
			}
		}
		case "solana": {
			try {
				let origin = await getOriginalAssetSol(new Connection(SOLANA_HOST), SOL_TOKEN_BRIDGE_ADDRESS, tokenAddress);
				address = tryUint8ArrayToNative(origin.assetAddress, origin.chainId);
				console.log("address", address);
				dispatch(
					setTargetAsset({
						doesExist: !!address,
						address: address,
					}),
				);
				if (address) {
					dispatch(
						setSourceWormholeWrappedInfo({
							assetAddress: address,
							chainId: origin.chainId,
							isWrapped: origin.isWrapped,
						}),
					);
				}
				break;
			} catch (e) {
				throw e;
			}
		}

		default:
			throw new NotImplementedError();
	}
	return address;
}

export async function getIsWrapped(param: { tokenAddress: string; sourceChain: ChainName; signer?: ethers.Signer }) {
	const { tokenAddress, sourceChain, signer } = param;
	switch (sourceChain) {
		case "ethereum": {
			if (!signer) throw new ArgumentNullOrUndefinedError();
			console.log("before", sourceChain, tokenAddress, signer)
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
