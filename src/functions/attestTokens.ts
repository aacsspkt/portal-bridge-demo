import base58 from 'bs58';
import { BigNumber, ethers } from 'ethers';

import {
  attestFromEth,
  ChainId,
  ChainName,
  getEmitterAddressEth,
  getSignedVAA,
  parseSequenceFromLogEth,
  postVaaSolanaWithRetry
} from '@certusone/wormhole-sdk';
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import {
  BRIDGE_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
  CONNECTION as connection,
  WORMHOLE_REST_ADDRESS,
} from '../constants_testnet';
import { createWrappedTokens } from './createWrapped';

export * from "./createWrapped";

/**
 *
 * @param sourceChain Source Chain Id
 * @param signer Signer
 * @param tokenAddress Token address
 * @returns Vaa URL of contract receipt of the attestation
 */
export async function attestToken(
	sourceChain: ChainName,
	signer: ethers.Signer,
	tokenAddress: string,
	payerAddress: PublicKey,
) {
	let tokenAttestation: ethers.ContractReceipt;
	switch (sourceChain) {
		case "ethereum":
			let gasLim : ethers.BigNumberish = 1000000;
			const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS["ethereum"].address;
			tokenAttestation = await attestFromEth(tokenBridgeAddress, signer, tokenAddress, {gasLimit:gasLim});
			const emitterAddr = getEmitterAddressEth(tokenBridgeAddress);
			const seq = parseSequenceFromLogEth(tokenAttestation, BRIDGE_ADDRESS["ethereum"].address);
			console.log("======  Getting signed VAA ======")
			const vaaURL =  `https://wormhole-v2-testnet-api.certus.one/v1/signed_vaa/2/000000000000000000000000f890982f9310df57d00f659cf4fd87e65aded8d7/1544`;
			console.log("Searching for: ", vaaURL);
			let vaaBytes = await (await fetch(vaaURL)).json();
			while(!vaaBytes.vaaBytes){
				console.log("VAA not found, retrying in 5s!");
				await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
				vaaBytes = await (await fetch(vaaURL)).json();
        	}
			const keypair = Keypair.fromSecretKey(base58.decode(process.env.REACT_APP_WALLET_SECRET_KEY as string));
			return createWrappedTokens(sourceChain, payerAddress, keypair, vaaBytes.vaaBytes);

		default:
			break;
	}
}
