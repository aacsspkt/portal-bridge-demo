import { ethers } from 'ethers';

import {
  ChainId,
  ChainName,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getForeignAssetSolana,
  getSignedVAA,
  hexToUint8Array,
  postVaaSolana,
  parseSequenceFromLogEth,
  tryNativeToHexString,
  createPostVaaInstructionSolana
  
} from '@certusone/wormhole-sdk';
import {
	Keypair,
  PublicKey,
  Signer,
  Transaction
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS,
  CONNECTION as connection,
  SOLANA_TOKEN_BRIDGE_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_REST_ADDRESS,
} from '../constants';

import { publicrpc } from "@certusone/wormhole-sdk-proto-web";

/**
 * @param sourceChain Source Chain Name
 * @param sourceChainId Source Chain Id
 * @param signer Signer
 * @param tokenAddress Token address
 * @param tokenAttestation token attestation (from attestTokens.ts)
 * @returns wrapped token address in target chain
 */
export async function createWrapped(
	sourceChain: ChainName,
	sourceChainId: ChainId,
	payerAddress: PublicKey,
	signer: Signer,
	tokenAddress: string,
	tokenAttestation: ethers.ContractReceipt,
	signedVAA:publicrpc.GetSignedVAAResponse
) {
	switch (sourceChain) {
		case "ethereum": {
			//post vaa
			const postVaaTxn = new Transaction()
			.add(
			  await createPostVaaInstructionSolana(
				BRIDGE_ADDRESS["solana"].address,
				payerAddress.toString(),
				Buffer.from(signedVAA.vaaBytes),
				signer as Keypair
			  )
			);

			const bridgeAddress = TOKEN_BRIDGE_ADDRESS["solana"].address;
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS["solana"].address;

			const txn = await createWrappedOnSolana(
				connection,
				bridgeAddress,
				tokenBridgeAddress,
				payerAddress.toString(),
				signedVAA.vaaBytes,
			);

			const wrappedTokenAddress = await getForeignAssetSolana(
				connection,
				SOLANA_TOKEN_BRIDGE_ADDRESS,
				sourceChainId,
				hexToUint8Array(tryNativeToHexString(tokenAddress, sourceChain)),
			);

			console.log("Wrapped token created at: ", wrappedTokenAddress);
			return wrappedTokenAddress;
		}

		default:
			break;
	}
}
