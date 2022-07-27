import { ethers } from 'ethers';

import {
  ChainId,
  getIsWrappedAssetEth,
  toChainName,
} from '@certusone/wormhole-sdk';

import { TOKEN_BRIDGE_ADDRESS } from '../constants';

export async function isWrapped(sourceChainId: ChainId, signer: ethers.Signer, tokenAddress: string) {
	switch (toChainName(sourceChainId)) {
		case "ethereum": {
			const is_wrapped = getIsWrappedAssetEth(TOKEN_BRIDGE_ADDRESS["ethereum"].address, signer, tokenAddress);
			console.log("Token Wrapped? ==> ", is_wrapped);
			return is_wrapped;
		}
	}
}
