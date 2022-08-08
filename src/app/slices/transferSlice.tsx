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
  targetChain: ChainId;
  amount: string;
  signedVAAHex: string | undefined;
  isSourceAssetWormholeWrapped: boolean | undefined;
  originChain: ChainId | undefined;
  originAsset: string | undefined;
  sourceWalletAddress: string | undefined;
  sourceParsedTokenAccount: ParsedTokenAccount | undefined;
  sourceParsedTokenAccounts: DataWrapper<ParsedTokenAccount[]>;
  targetAddressHex: string | undefined;
  targetAsset: DataWrapper<ForeignAssetInfo>;
  targetParsedTokenAccount: ParsedTokenAccount | undefined;
}

const initialState: TransferState = {
  sourceChain: CHAIN_ID_SOLANA,
  targetChain: CHAIN_ID_ETH,
  isSourceAssetWormholeWrapped: false,
  sourceWalletAddress: undefined,
  sourceParsedTokenAccount: undefined,
  sourceParsedTokenAccounts: getEmptyDataWrapper(),
  originChain: undefined,
  originAsset: undefined,
  signedVAAHex: undefined,

  amount: "",
  targetAddressHex: undefined,
  targetAsset: getEmptyDataWrapper(),
  targetParsedTokenAccount: undefined,

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
    setSignedVAAHex: (state, action: PayloadAction<string>) => {
      state.signedVAAHex = action.payload;
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
  setAmount,
  setTargetChain,
  setTargetAddressHex,
  setTargetAsset,
  setTargetParsedTokenAccount,
  setSignedVAAHex,
} = transferSlice.actions

export default transferSlice.reducer
