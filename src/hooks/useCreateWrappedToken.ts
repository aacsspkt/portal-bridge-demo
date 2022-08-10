import { ethers } from 'ethers';

import {
  ChainName,
  createWrappedOnEth,
  createWrappedOnSolana,
  postVaaSolanaWithRetry,
} from '@certusone/wormhole-sdk';
import {
  Connection,
  Keypair,
  SendTransactionError,
} from '@solana/web3.js';

import {
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  SOLANA_HOST,
  ETH_TOKEN_BRIDGE_ADDRESS,
} from '../constants';
// import {
//   BRIDGE_ADDRESS_TESTNET,
//   CONNECTION_TESTNET as connection,
//   RECIPIENT_WALLET_ADDRESS_TESTNET,
//   TOKEN_BRIDGE_ADDRESS_TESTNET,
// } from '../constants_testnet';
import {
  sendAndConfirmTransaction,
  signTransaction,
} from '../utils/solana';
import { Dispatch } from 'redux';

/**
 * @param payerAddress Public Key of the fee payer
 * @param targetChain Source Chain Name
 * @param signer Signer who signs and pay
 * @param signedVAA Vaa obtained after attestation
 * @returns Array of transaction signature
 * */

