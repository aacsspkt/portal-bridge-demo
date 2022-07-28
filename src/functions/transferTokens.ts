import {
  BigNumberish,
  Signer,
} from 'ethers';

import {
  approveEth,
  ChainName,
  getEmitterAddressEth,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
  transferFromEth,
} from '@certusone/wormhole-sdk';

import {
  BRIDGE_ADDRESS_TESTNET,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
  WORMHOLE_REST_ADDRESS_TESTNET,
} from '../constants_testnet';
import { NotImplementedError } from '../errors';

export async function transferTokens(
	sourceChain: ChainName,
	signer: Signer,
	tokenAddress: string,
	amount: BigNumberish,
	recipientAddress: Uint8Array,
	relayerFee?: BigNumberish,
) {
	switch (sourceChain) {
		case "ethereum":
			console.log("transfering token: " + tokenAddress);
			console.log("approve token transfer");
			const approve_receipt = await approveEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
				tokenAddress,
				signer,
				amount,
			);
			console.log("approval receipt hash:", approve_receipt.transactionHash);

			console.log("transfering");
			const transfer_receipt = await transferFromEth(
				TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
				signer,
				tokenAddress,
				amount,
				"solana",
				recipientAddress,
				relayerFee,
				{ gasLimit: 10000000 },
			);
			console.log("transfer receipt hash:", transfer_receipt.transactionHash);

			const sequence = parseSequenceFromLogEth(transfer_receipt, BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address);
			console.log("sequence no:", sequence);
			const emitterAddress = getEmitterAddressEth(TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address);
			console.log("emitter address:", emitterAddress);

			console.log("fetching vaa...");
			const { vaaBytes } = await getSignedVAAWithRetry(
				[WORMHOLE_REST_ADDRESS_TESTNET],
				"ethereum",
				emitterAddress,
				sequence,
			);
			console.log("signedVaa:", vaaBytes.toString());
			return vaaBytes;

		default:
			throw new NotImplementedError();
	}
}
