import {
  BigNumberish,
  ethers,
} from 'ethers';

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
  redeemOnSolana,
  transferFromEth,
  transferFromSolana,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk';
import {
  Account,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

import {
  CONNECTION,
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  KEYPAIR,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import minABI from '../contracts/abi/minAbi.json';
import { NotImplementedError } from '../errors';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';

export async function transferTokens(
	sourceChain: ChainName,
	targetChain: ChainName,
	provider: ethers.providers.Web3Provider,
	tokenAddress: string,
	amount: number,
	originAddress: string,
	originChain: ChainName,
	recipientAddress: string,
	relayerFee?: BigNumberish,
) {
	let recipientTokenAccount: Account;
	let transferAmount: BigNumberish;
	switch (sourceChain) {
		case "ethereum":
			try {
				const contract = new ethers.Contract(tokenAddress, JSON.stringify(minABI), provider);
				const decimals = await contract.decimals();
				console.log(decimals);
				transferAmount = ethers.utils.parseUnits(amount.toString(), decimals);
				console.log(transferAmount);
				const ethSigner = provider.getSigner();
				console.log("transfering token: " + tokenAddress);
				console.log("approve token transfer");
				const approve_receipt = await approveEth(ETH_TOKEN_BRIDGE_ADDRESS, tokenAddress, ethSigner, transferAmount);
				console.log("approval receipt hash:", approve_receipt.transactionHash);
				recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
					new Connection(SOLANA_HOST),
					KEYPAIR,
					new PublicKey(tokenAddress),
					KEYPAIR.publicKey,
				);

				console.log("transfering");
				const transfer_receipt = await transferFromEth(
					ETH_TOKEN_BRIDGE_ADDRESS,
					ethSigner,
					tokenAddress,
					transferAmount,
					"solana",
					recipientTokenAccount.address.toBytes(),
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
				recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
					CONNECTION,
					KEYPAIR,
					new PublicKey(tokenAddress),
					KEYPAIR.publicKey,
				);
				console.log("recipient address", recipientAddress);
				console.log("recipient token address", recipientTokenAccount.address.toString());
				console.log(" token address", tokenAddress);

				const mintInfo = await getMint(CONNECTION, new PublicKey(tokenAddress), "confirmed");

				transferAmount = BigInt(amount) * BigInt(10 ** mintInfo.decimals);
				console.log(transferAmount);
				const targetAddress = await provider.getSigner().getAddress();
				console.log("target address", targetAddress);

				console.log("Creating transfer txn");
				const txn = await transferFromSolana(
					CONNECTION,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					recipientAddress,
					recipientTokenAccount.address.toString(),
					tokenAddress,
					transferAmount,
					tryNativeToUint8Array(targetAddress, targetChain),
					originChain,
					tryNativeToUint8Array(originAddress, originChain),
					"ethereum",
				);

				console.log("sending txn");
				const txnId = await sendAndConfirmTransaction(CONNECTION, signTransaction, txn, 10);
				console.log("txnId:", txnId);
				const txnRes = await CONNECTION.getTransaction(txnId);
				if (!txnRes) throw new Error("Transaction: " + txnId + " not found");
				const sequence = parseSequenceFromLogSolana(txnRes);
				const emitterAddress = await getEmitterAddressSolana(SOL_BRIDGE_ADDRESS);

				console.log("Fetching signed vaa.");
				const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, "solana", emitterAddress, sequence);
				console.log("vaabytes:", vaaBytes);

				let transferCompleted = false;
				do {
					transferCompleted = await getIsTransferCompletedEth(SOL_TOKEN_BRIDGE_ADDRESS, provider.getSigner(), vaaBytes);
					await new Promise((r) => setTimeout(r, 5000));
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
