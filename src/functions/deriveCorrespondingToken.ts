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

import {
  CONNECTION_TESTNET,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
} from '../constants_testnet';
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
					CONNECTION_TESTNET,
					TOKEN_BRIDGE_ADDRESS_TESTNET.solana.address,
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
					TOKEN_BRIDGE_ADDRESS_TESTNET.ethereum_goerli.address,
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
				let origin = await getOriginalAssetEth(
					TOKEN_BRIDGE_ADDRESS_TESTNET.ethereum_goerli.address,
					signer,
					tokenAddress,
					targetChain,
				);
				return tryUint8ArrayToNative(origin.assetAddress, origin.chainId);
			} catch (e) {
				throw e;
			}
		}
		case "solana": {
			try {
				let origin = await getOriginalAssetSol(
					CONNECTION_TESTNET,
					TOKEN_BRIDGE_ADDRESS_TESTNET.solana.address,
					tokenAddress,
				);
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
			const is_wrapped = await getIsWrappedAssetEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET.ethereum_goerli.address,
				signer,
				tokenAddress,
			);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
		case "solana": {
			const is_wrapped = await getIsWrappedAssetSol(
				CONNECTION_TESTNET,
				TOKEN_BRIDGE_ADDRESS_TESTNET.solana.address,
				tokenAddress,
			);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
		default:
			throw new NotImplementedError();
	}
}
