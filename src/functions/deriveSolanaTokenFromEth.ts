import {
  ChainName,
  getForeignAssetSolana,
  hexToUint8Array,
  tryNativeToHexString,
} from '@certusone/wormhole-sdk';
import { PublicKey } from '@solana/web3.js';

import {
  //CONNECTION as connection,
  TOKEN_BRIDGE_ADDRESS,
} from '../constants';
import { TOKEN_BRIDGE_ADDRESS_TESTNET,CONNECTION_TESTNET as connection } from '../constants_testnet';


export async function deriveCorrespondingToken(tokenAddress: string, sourceChain: ChainName, targetChain: ChainName) {
	switch (targetChain) {
		case "solana":
			const str = await getForeignAssetSolana(
				connection,
				TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
				sourceChain,
				hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
			);
			return str !== null ? new PublicKey(str) : str;

		default:
			throw new Error("Not Implemented");
	}
}
