import {
  BigNumberish,
  ethers,
} from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import {
  approveEth,
  ChainName,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getIsTransferCompletedEth,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolanaWithRetry,
  redeemOnEth,
  redeemOnSolana,
  transferFromEth,
  transferFromSolana,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk';

import { ParsedTokenAccount } from '../app/slices/transferSlice';
import {
  CONNECTION,
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  KEYPAIR,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import { NotImplementedError } from '../errors';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';

export async function transferTokens(
	sourceChain: ChainName,
	targetChain: ChainName,
	provider: ethers.providers.Web3Provider,
	sourceAsset: ParsedTokenAccount,
	targetAddressHex: string,
	amount: number,
	recipientAddress: string,
	originAddress?: string,
	originChain?: ChainName,
	relayerFee?: BigNumberish,
) {
	let transferAmount: BigNumberish;
	switch (sourceChain) {
		case "ethereum":
			try {
				console.log("recipient address", recipientAddress);

				transferAmount = parseUnits(amount.toString(), sourceAsset.decimals);
				console.log("transferAmount", transferAmount);
				const ethSigner = provider.getSigner();
				console.log("transfering token: " + sourceAsset.mintKey);
				console.log("approve token transfer");
				const approve_receipt = await approveEth(
					ETH_TOKEN_BRIDGE_ADDRESS,
					sourceAsset.mintKey,
					ethSigner,
					transferAmount,
				);
				console.log("approval receipt hash:", approve_receipt.transactionHash);

				console.log("transfering");
				const transfer_receipt = await transferFromEth(
					ETH_TOKEN_BRIDGE_ADDRESS,
					ethSigner,
					sourceAsset.mintKey,
					transferAmount,
					targetChain,
					tryNativeToUint8Array(targetAddressHex, targetChain),
					relayerFee,
					{ gasLimit: 10000000 },
				);
				console.log("transfer receipt hash:", transfer_receipt.transactionHash);

				const sequence = parseSequenceFromLogEth(transfer_receipt, ETH_BRIDGE_ADDRESS);
				console.log("sequence no:", sequence);
				const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
				console.log("emitter address:", emitterAddress);

				console.log("fetching vaa...");
				const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, "ethereum", emitterAddress, sequence);
				console.log("signedVaa:", vaaBytes.toString());

				//post vaa
				console.log("posting vaa");
				await postVaaSolanaWithRetry(
					CONNECTION,
					signTransaction,
					SOL_BRIDGE_ADDRESS,
					KEYPAIR.publicKey.toString(),
					Buffer.from(vaaBytes),
					10,
				);
				console.log("vaa posted");

				// redeem token
				console.log("redeeming token on solana");
				const redeemTxn = await redeemOnSolana(
					CONNECTION,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					KEYPAIR.publicKey.toString(),
					vaaBytes,
				);

				const { blockhash } = await CONNECTION.getRecentBlockhash();
				redeemTxn.recentBlockhash = blockhash;

				await sendAndConfirmTransaction(CONNECTION, signTransaction, redeemTxn, 10);
				console.log("token redeemed");
				break;
			} catch (error) {
				console.log(error);
				throw error;
			}

		case "solana":
			try {
				console.log("Begin transferring...");
				console.log("fromAccount", sourceAsset.publicKey);
				console.log("sourceMint", sourceAsset.mintKey);

				transferAmount = parseUnits(amount.toString(), sourceAsset.decimals);
				console.log("transferAmount", transferAmount);
				const targetAddress = await provider.getSigner().getAddress();
				console.log("targetAddress", targetAddress);
				console.log("targetAddress", targetAddressHex);
				console.log("targetChain", targetChain);
				console.log("originAddress", originAddress);
				console.log("originChain", originChain);

				console.log("Creating transfer txn");
				const txn = await transferFromSolana(
					CONNECTION,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					KEYPAIR.publicKey.toString(),
					sourceAsset.publicKey,
					sourceAsset.mintKey,
					transferAmount.toBigInt(),
					tryNativeToUint8Array(targetAddress, targetChain),
					targetChain,
					originAddress && originChain ? tryNativeToUint8Array(originAddress, originChain) : undefined,
					originChain,
				);

				console.log("sending txn");
				const txnId = await sendAndConfirmTransaction(CONNECTION, signTransaction, txn, 10);
				console.log("txnId:", txnId);
				const txnRes = await CONNECTION.getTransaction(txnId);
				if (!txnRes) throw new Error("Transaction: " + txnId + " not found");
				const sequence = parseSequenceFromLogSolana(txnRes);
				const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);

				console.log("Fetching signed vaa.");
				const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, "solana", emitterAddress, sequence);
				console.log("vaabytes:", vaaBytes);

				const signer = provider.getSigner();
				let transferCompleted = false;
				do {
					const redeemReciept = await redeemOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, vaaBytes);
					console.log("token redeemed:\n", redeemReciept);
					transferCompleted = await getIsTransferCompletedEth(SOL_TOKEN_BRIDGE_ADDRESS, signer, vaaBytes);
				} while (!transferCompleted);
				console.log("Transferring completed.");
				break;
			} catch (error) {
				console.error(error);
				throw error;
			}

		default:
			throw new NotImplementedError();
	}
}
