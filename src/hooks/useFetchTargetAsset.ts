import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { ethers } from 'ethers';

import {
  ChainId,
  getForeignAssetEth,
  getForeignAssetSolana,
  hexToUint8Array,
  isEVMChain,
  tryHexToNativeAssetString,
} from '@certusone/wormhole-sdk';
// import { BigNumber } from '@ethersproject/bignumber';
// import { arrayify } from '@ethersproject/bytes';
import { Connection } from '@solana/web3.js';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import {
  errorDataWrapper,
  fetchDataWrapper,
  receiveDataWrapper,
} from '../app/slices/helpers';
import { setTargetAsset } from '../app/slices/transferSlice';
import {
  getEvmChainId,
  getTokenBridgeAddressForChain,
  isSolanaChain,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
} from '../constants';
import { useEthereumProvider } from '../contexts/EthereumContextProvider';

function useFetchTargetAsset() {
	const dispatch = useAppDispatch();
	const isSourceAssetWormholeWrapped = useAppSelector((state) => state.transfer.isSourceAssetWormholeWrapped);
	const originChain = useAppSelector((state) => state.transfer.originChain);
	const originAsset = useAppSelector((state) => state.transfer.originAsset);
	const targetChain = useAppSelector((state) => state.transfer.targetChain);
	const { provider, chainId: evmChainId } = useEthereumProvider();
	const correctEvmNetwork = getEvmChainId(targetChain);
	const hasCorrectEvmNetwork = evmChainId === correctEvmNetwork;
	const [lastSuccessfulArgs, setLastSuccessfulArgs] = useState<{
		isSourceAssetWormholeWrapped: boolean | undefined;
		originChain: ChainId | undefined;
		originAsset: string | undefined;
		targetChain: ChainId;
	} | null>(null);
	const argsMatchLastSuccess =
		!!lastSuccessfulArgs &&
		lastSuccessfulArgs.isSourceAssetWormholeWrapped === isSourceAssetWormholeWrapped &&
		lastSuccessfulArgs.originChain === originChain &&
		lastSuccessfulArgs.originAsset === originAsset &&
		lastSuccessfulArgs.targetChain === targetChain;
	const setArgs = useCallback(
		() =>
			setLastSuccessfulArgs({
				isSourceAssetWormholeWrapped,
				originChain,
				originAsset,
				targetChain,
			}),
		[isSourceAssetWormholeWrapped, originChain, originAsset, targetChain],
	);
	useEffect(() => {
		if (argsMatchLastSuccess) {
			return;
		}
		setLastSuccessfulArgs(null);
		let ignore = false;
		(async () => {
			if (isSourceAssetWormholeWrapped && originChain === targetChain && originAsset) {
				if (!ignore) {
					dispatch(
						setTargetAsset(
							receiveDataWrapper({
								doesExist: true,
								address: tryHexToNativeAssetString(originAsset, originChain),
							}),
						),
					);
					setArgs();
				}
				return;
			}
			if (isEVMChain(targetChain) && provider && hasCorrectEvmNetwork && originChain && originAsset) {
				dispatch(setTargetAsset(fetchDataWrapper()));
				try {
					const asset = await getForeignAssetEth(
						getTokenBridgeAddressForChain(targetChain),
						provider,
						originChain,
						hexToUint8Array(originAsset),
					);
					if (!ignore) {
						dispatch(
							setTargetAsset(
								receiveDataWrapper({
									doesExist: asset !== ethers.constants.AddressZero,
									address: asset,
								}),
							),
						);
						setArgs();
					}
				} catch (e) {
					if (!ignore) {
						dispatch(setTargetAsset(errorDataWrapper("Unable to determine existence of wrapped asset")));
					}
				}
			}
			if (isSolanaChain(targetChain) && originChain && originAsset) {
				dispatch(setTargetAsset(fetchDataWrapper()));
				try {
					const connection = new Connection(SOLANA_HOST, "confirmed");
					const asset = await getForeignAssetSolana(
						connection,
						SOL_TOKEN_BRIDGE_ADDRESS,
						originChain,
						hexToUint8Array(originAsset),
					);
					if (!ignore) {
						dispatch(setTargetAsset(receiveDataWrapper({ doesExist: !!asset, address: asset })));
						setArgs();
					}
				} catch (e) {
					if (!ignore) {
						dispatch(setTargetAsset(errorDataWrapper("Unable to determine existence of wrapped asset")));
					}
				}
			}
		})();
		return () => {
			ignore = true;
		};
	}, [
		dispatch,
		isSourceAssetWormholeWrapped,
		originChain,
		originAsset,
		targetChain,
		provider,
		setTargetAsset,
		hasCorrectEvmNetwork,
		argsMatchLastSuccess,
		setArgs,
	]);
}

export default useFetchTargetAsset;
