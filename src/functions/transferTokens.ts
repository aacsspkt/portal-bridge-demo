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
  hexToUint8Array,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolanaWithRetry,
  redeemOnSolana,
  transferFromEth,
  transferFromSolana,
  tryNativeToHexString,
} from '@certusone/wormhole-sdk';
import {
  Account,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { KEYPAIR } from '../constants';
import {
  BRIDGE_ADDRESS_TESTNET,
  CONNECTION_TESTNET,
  RECIPIENT_WALLET_ADDRESS_TESTNET,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
  WORMHOLE_REST_ADDRESS_TESTNET,
} from '../constants_testnet';
import minABI from '../contracts/abi/minAbi.json';
import { NotImplementedError } from '../errors';
import {
  sendAndConfirmTransactions,
  signTransaction,
} from '../utils/solana';

export async function transferTokens(
	sourceChain: ChainName,
	targetChain: ChainName,
	provider: ethers.providers.Web3Provider,
	tokenAddress: string,
	amount: number,
	recipientAddress: string,
	relayerFee?: BigNumberish,
) {
	let recipientTokenAddress: Account;
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
				const approve_receipt = await approveEth(
					TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
					tokenAddress,
					ethSigner,
					transferAmount,
				);
				console.log("approval receipt hash:", approve_receipt.transactionHash);
				recipientTokenAddress = await getOrCreateAssociatedTokenAccount(
					CONNECTION_TESTNET,
					KEYPAIR,
					new PublicKey(tokenAddress),
					RECIPIENT_WALLET_ADDRESS_TESTNET,
				);

				console.log("transfering");
				const transfer_receipt = await transferFromEth(
					TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
					ethSigner,
					tokenAddress,
					transferAmount,
					"solana",
					recipientTokenAddress.address.toBytes(),
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

				//post vaa
				console.log("posting vaa");
				await postVaaSolanaWithRetry(
					CONNECTION_TESTNET,
					signTransaction,
					BRIDGE_ADDRESS_TESTNET["solana"].address,
					RECIPIENT_WALLET_ADDRESS_TESTNET.toString(),
					Buffer.from(vaaBytes),
					10,
				);
				console.log("vaa posted");

				// redeem token
				console.log("redeeming token on solana");
				const redeemTxn = await redeemOnSolana(
					CONNECTION_TESTNET,
					BRIDGE_ADDRESS_TESTNET["solana"].address,
					TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
					RECIPIENT_WALLET_ADDRESS_TESTNET.toString(),
					vaaBytes,
				);
				await sendAndConfirmTransactions(
					CONNECTION_TESTNET,
					signTransaction,
					[redeemTxn],
					RECIPIENT_WALLET_ADDRESS_TESTNET,
					10,
				);
				console.log("token redeemed");
				break;
			} catch (error) {
				console.log(error);
				throw error;
			}

		case "solana":
			try {
				console.log("Begin transferring...");
				recipientTokenAddress = await getOrCreateAssociatedTokenAccount(
					CONNECTION_TESTNET,
					KEYPAIR,
					new PublicKey(tokenAddress),
					RECIPIENT_WALLET_ADDRESS_TESTNET,
				);
				console.log("recipient token address", recipientTokenAddress.address.toString())
				console.log(" token address", tokenAddress)

				const mintInfo = await getMint(CONNECTION_TESTNET, new PublicKey(tokenAddress), "confirmed");
				transferAmount = BigInt(amount) * BigInt(mintInfo.decimals);

				const targetAddress = await provider.getSigner().getAddress();
				console.log("target address",targetAddress)

				console.log("Creating transfer txn");
				const txn = await transferFromSolana(
					CONNECTION_TESTNET,
					BRIDGE_ADDRESS_TESTNET.solana.address,
					TOKEN_BRIDGE_ADDRESS_TESTNET.solana.address,
					recipientAddress,
					recipientTokenAddress.address.toString(),
					tokenAddress,
					transferAmount,
					hexToUint8Array(tryNativeToHexString(targetAddress, targetChain)),
					targetChain,
				);

				console.log("sending txn",txn);
				const txnIds = await sendAndConfirmTransactions(
					CONNECTION_TESTNET,
					signTransaction,
					[txn],
					RECIPIENT_WALLET_ADDRESS_TESTNET,
					10,
				);
				const txnRes = await CONNECTION_TESTNET.getTransaction(txnIds[0]);
				if (!txnRes) throw new Error("Transaction: " + txnIds[0] + " not found");
				const sequence = parseSequenceFromLogSolana(txnRes);
				const emitterAddress = await getEmitterAddressSolana(BRIDGE_ADDRESS_TESTNET.solana.address);

				console.log("Fetching signed vaa.");
				const { vaaBytes } = await getSignedVAAWithRetry(
					[WORMHOLE_REST_ADDRESS_TESTNET],
					"solana",
					emitterAddress,
					sequence,
				);
				let transferCompleted = false;
				do {
					transferCompleted = await getIsTransferCompletedEth(
						TOKEN_BRIDGE_ADDRESS_TESTNET.ethereum_goerli.address,
						provider.getSigner(),
						vaaBytes,
					);
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
