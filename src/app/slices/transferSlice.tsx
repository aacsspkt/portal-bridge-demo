import {
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  ChainId,
} from '@certusone/wormhole-sdk';
import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import {
  ForeignAssetInfo,
  StateSafeWormholeWrappedInfo,
} from '../../functions';
import {
  DataWrapper,
  errorDataWrapper,
  fetchDataWrapper,
  getEmptyDataWrapper,
  receiveDataWrapper,
} from './helpers';

export interface ParsedTokenAccount {
  publicKey: string;
  mintKey: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
  symbol?: string;
  name?: string;
  logo?: string;
  isNativeAsset?: boolean;
}

export interface Transaction {
  id: string;
  block: number;
}

//declare types for state
interface TransferState {
  sourceChain: ChainId;
  sourceWalletAddress: string | undefined;
  sourceParsedTokenAccounts: DataWrapper<ParsedTokenAccount[]>;
  sourceParsedTokenAccount: ParsedTokenAccount | undefined;
  isSourceAssetWormholeWrapped: boolean | undefined;
  originChain: ChainId | undefined;
  originAsset: string | undefined;
  targetChain: ChainId;
  targetParsedTokenAccount: ParsedTokenAccount | undefined;
  targetAddressHex: string | undefined;
  targetAsset: DataWrapper<ForeignAssetInfo>;
  amount: string;
  transferTx: Transaction | undefined;
  signedVAAHex: string | undefined;
  isSending: boolean,
  isRedeeming: boolean;
  redeemTx: Transaction | undefined;
}

const initialState: TransferState = {
  sourceChain: CHAIN_ID_SOLANA,
  sourceWalletAddress: undefined,
  sourceParsedTokenAccounts: getEmptyDataWrapper(),
  sourceParsedTokenAccount: undefined,
  isSourceAssetWormholeWrapped: false,
  originChain: undefined,
  originAsset: undefined,
  targetChain: CHAIN_ID_ETH,
  targetParsedTokenAccount: undefined,
  targetAddressHex: undefined,
  targetAsset: getEmptyDataWrapper(),
  amount: "",
  transferTx: undefined,
  signedVAAHex: undefined,
  isSending: false,
  isRedeeming: false,
  redeemTx: undefined,
}

export const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    setSourceChain: (state, action: PayloadAction<ChainId>) => {
      const prevChain = state.sourceChain;
      state.sourceChain = action.payload;
      state.sourceParsedTokenAccount = undefined;
      state.sourceParsedTokenAccounts = getEmptyDataWrapper();
      state.targetAsset = getEmptyDataWrapper();
      state.targetParsedTokenAccount = undefined;
      state.targetAddressHex = undefined;
      state.isSourceAssetWormholeWrapped = undefined;
      state.originChain = undefined;
      state.originAsset = undefined;
      if (state.targetChain === action.payload) {
        state.targetChain = prevChain;
      }
    },
    setSourceWormholeWrappedInfo: (
      state,
      action: PayloadAction<StateSafeWormholeWrappedInfo>
    ) => {
      state.isSourceAssetWormholeWrapped = action.payload.isWrapped;
      state.originChain = action.payload.chainId;
      state.originAsset = action.payload.assetAddress;
    },
    setSourceWalletAddress: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.sourceWalletAddress = action.payload;
    },
    setSourceParsedTokenAccount: (
      state,
      action: PayloadAction<ParsedTokenAccount | undefined>
    ) => {
      state.sourceParsedTokenAccount = action.payload;
      // clear targetAsset so that components that fire before useFetchTargetAsset don't get stale data
      state.targetAsset = getEmptyDataWrapper();
      state.targetParsedTokenAccount = undefined;
      state.targetAddressHex = undefined;
      state.isSourceAssetWormholeWrapped = undefined;
      state.originChain = undefined;
      state.originAsset = undefined;
    },
    setTransferTx: (state, action: PayloadAction<Transaction>) => {
      state.transferTx = action.payload;
    },
    setSignedVAAHex: (state, action: PayloadAction<string>) => {
      state.signedVAAHex = action.payload;
      state.isSending = false;
    },
    setIsSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },
    setIsRedeeming: (state, action: PayloadAction<boolean>) => {
      state.isRedeeming = action.payload;
    },
    setRedeemTx: (state, action: PayloadAction<Transaction>) => {
      state.redeemTx = action.payload;
      state.isRedeeming = false;
    },
    setSourceParsedTokenAccounts: (
      state,
      action: PayloadAction<ParsedTokenAccount[] | undefined>
    ) => {
      state.sourceParsedTokenAccounts = action.payload
        ? receiveDataWrapper(action.payload)
        : getEmptyDataWrapper();
    },
    fetchSourceParsedTokenAccounts: (state) => {
      state.sourceParsedTokenAccounts = fetchDataWrapper();
    },
    errorSourceParsedTokenAccounts: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.sourceParsedTokenAccounts = errorDataWrapper(
        action.payload || "An unknown error occurred."
      );
    },
    receiveSourceParsedTokenAccounts: (
      state,
      action: PayloadAction<ParsedTokenAccount[]>
    ) => {
      state.sourceParsedTokenAccounts = receiveDataWrapper(action.payload);
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    setTargetChain: (state, action: PayloadAction<ChainId>) => {
      const prevChain = state.targetChain;
      state.targetChain = action.payload;
      state.targetAddressHex = undefined;
      // clear targetAsset so that components that fire before useFetchTargetAsset don't get stale data
      state.targetAsset = getEmptyDataWrapper()
      state.targetParsedTokenAccount = undefined;
      if (state.sourceChain === action.payload) {
        state.sourceChain = prevChain;
        state.sourceParsedTokenAccount = undefined;
        state.isSourceAssetWormholeWrapped = undefined;
        state.originChain = undefined;
        state.originAsset = undefined;
        state.sourceParsedTokenAccounts = getEmptyDataWrapper();
      }
    },
    setTargetAddressHex: (state, action: PayloadAction<string | undefined>) => {
      state.targetAddressHex = action.payload;
    },
    setTargetAsset: (
      state,
      action: PayloadAction<DataWrapper<ForeignAssetInfo>>
    ) => {
      state.targetAsset = action.payload;
      state.targetParsedTokenAccount = undefined;
    },
    setTargetParsedTokenAccount: (
      state,
      action: PayloadAction<ParsedTokenAccount | undefined>
    ) => {
      state.targetParsedTokenAccount = action.payload;
    },
  }

})


export const {
  setSourceChain,
  setSourceWormholeWrappedInfo,
  setSourceWalletAddress,
  setSourceParsedTokenAccount,
  setSourceParsedTokenAccounts,
  receiveSourceParsedTokenAccounts,
  errorSourceParsedTokenAccounts,
  fetchSourceParsedTokenAccounts,
  setTransferTx,
  setAmount,
  setTargetChain,
  setTargetAddressHex,
  setTargetAsset,
  setTargetParsedTokenAccount,
  setSignedVAAHex,
  setIsRedeeming,
  setIsSending,
  setRedeemTx
} = transferSlice.actions

export default transferSlice.reducer
