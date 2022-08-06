import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import {
  CHAIN_ID_SOLANA,
  ChainId,
  getOriginalAssetEth,
  getOriginalAssetSol,
  isEVMChain,
  uint8ArrayToHex,
  WormholeWrappedInfo,
} from '@certusone/wormhole-sdk';
import { Connection } from '@solana/web3.js';

import { useAppSelector } from '../app/hooks';
import { setSourceWormholeWrappedInfo } from '../app/slices/transferSlice';
import {
  getTokenBridgeAddressForChain,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
} from '../constants';
import { useEthereumProvider } from '../contexts/EthereumContextProvider';

export interface StateSafeWormholeWrappedInfo {
	isWrapped: boolean;
	chainId: ChainId;
	assetAddress: string;
	tokenId?: string;
}

const isSolanaChain = (chain: ChainId) => {
	return chain === CHAIN_ID_SOLANA;
};

const makeStateSafe = (info: WormholeWrappedInfo): StateSafeWormholeWrappedInfo => ({
	...info,
	assetAddress: uint8ArrayToHex(info.assetAddress),
});

function useCheckIfWormholeWrapped() {
	const dispatch = useDispatch();
	const sourceChain = useAppSelector((state) => state.transfer.sourceChain);
	const sourceAsset = useAppSelector((state) => state.transfer.sourceParsedTokenAccount?.mintKey);
	const { provider } = useEthereumProvider();
	useEffect(() => {
		// TODO: loading state, error state
		let cancelled = false;
		(async () => {
			if (isEVMChain(sourceChain) && provider && sourceAsset) {
				const wrappedInfo = makeStateSafe(
					await getOriginalAssetEth(getTokenBridgeAddressForChain(sourceChain), provider, sourceAsset, sourceChain),
				);
				if (!cancelled) {
					dispatch(setSourceWormholeWrappedInfo(wrappedInfo));
				}
			}
			if (isSolanaChain(sourceChain) && sourceAsset) {
				try {
					const connection = new Connection(SOLANA_HOST, "confirmed");
					const wrappedInfo = makeStateSafe(
						await getOriginalAssetSol(connection, SOL_TOKEN_BRIDGE_ADDRESS, sourceAsset),
					);
					if (!cancelled) {
						dispatch(setSourceWormholeWrappedInfo(wrappedInfo));
					}
				} catch (e) {}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [dispatch, sourceChain, sourceAsset, provider, setSourceWormholeWrappedInfo]);
}

export default useCheckIfWormholeWrapped;
