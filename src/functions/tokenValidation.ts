import { utils } from 'ethers';

import { ChainName } from '@certusone/wormhole-sdk';
import { PublicKey } from '@solana/web3.js';

export function isValidToken(tokenAddress: string, sourceChain: ChainName) {
	switch (sourceChain) {
		case "ethereum":
			return utils.isAddress(tokenAddress);

		case "solana":
			try {
				const pubkey = new PublicKey(tokenAddress);
				return PublicKey.isOnCurve(pubkey); // this checks pdas
			} catch (e) {
				return false;
			}

		default:
			return false; // temporarily return false until implemented for other chains
	}
}
