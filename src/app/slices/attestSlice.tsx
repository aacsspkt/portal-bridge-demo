import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
} from "@certusone/wormhole-sdk";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ForeignAssetInfo } from "../../functions";
import { DataWrapper, getEmptyDataWrapper } from "./helpers";
import { Transaction } from "./transferSlice";


export interface AttestState {
  sourceChain: ChainId;
  sourceAsset: string;
  targetAsset: DataWrapper<ForeignAssetInfo>;
  targetChain: ChainId;
  attestTx: Transaction | undefined;
  signedVAAHex: string | undefined;
  createTx: Transaction | undefined;

}

const initialState: AttestState = {
  sourceChain: CHAIN_ID_SOLANA,
  sourceAsset: "",
  targetAsset: getEmptyDataWrapper(),
  targetChain: CHAIN_ID_ETH,
  attestTx: undefined,
  signedVAAHex: undefined,
  createTx: undefined,
};

export const attestSlice = createSlice({
  name: "attest",
  initialState,
  reducers: {
    setSourceChain: (state, action: PayloadAction<ChainId>) => {
      const prevChain = state.sourceChain
      state.sourceChain = action.payload;
      state.sourceAsset = "";
      state.targetAsset = getEmptyDataWrapper();
       if (state.targetChain === action.payload) {
        state.targetChain = prevChain;
      }

    },
    setSourceAsset: (state, action: PayloadAction<string>) => {
      state.sourceAsset = action.payload;
      state.targetAsset = getEmptyDataWrapper();
     
    },
    setTargetAsset: (state, action: PayloadAction<DataWrapper<ForeignAssetInfo>>
    ) => {
      state.targetAsset = action.payload;
    },
    setTargetChain: (state, action: PayloadAction<ChainId>) => {
      state.targetChain = action.payload;
      state.targetAsset = getEmptyDataWrapper();

      
    },
    setAttestTx: (state, action: PayloadAction<Transaction>) => {
      state.attestTx = action.payload;
    },
    setSignedVAAHex: (state, action: PayloadAction<string>) => {
      state.signedVAAHex = action.payload;

    },
    setCreateTx: (state, action: PayloadAction<Transaction>) => {
      state.createTx = action.payload;

    },

    reset: (state) => ({
      ...initialState,
      sourceChain: state.sourceChain,
      targetChain: state.targetChain,
    }),
  },
});

export const {
  setSourceChain,
  setSourceAsset,
  setTargetChain,
  setAttestTx,
  setTargetAsset,
  setSignedVAAHex,
  setCreateTx,
  reset,
} = attestSlice.actions;

export default attestSlice.reducer;
