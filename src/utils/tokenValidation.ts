import { utils } from 'ethers';

import { ChainName } from '@certusone/wormhole-sdk';
import { PublicKey } from '@solana/web3.js';

export function isValidToken(tokenAddress: string, sourceChain: ChainName) {
	console.log("isValidToken");
	switch (sourceChain) {
		case "ethereum":
			console.log("is ethereum token");
			return utils.isAddress(tokenAddress);

		case "solana":
			console.log("is solana");
			try {
				const _ = new PublicKey(tokenAddress);
				return true;
			} catch (e) {
				return false;
			}

		default:
			console.log(`Not implemented for tokens in ${sourceChain}`);
			return false; // temporarily return false until implemented for other chains
	}
}
