import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
} from "@certusone/wormhole-sdk";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "./transferSlice";


export interface AttestState {
  sourceChain: ChainId;
  sourceAsset: string;
  targetAsset: string;
  targetChain: ChainId;
  attestTx: Transaction | undefined;
  signedVAAHex: string | undefined;
  createTx: Transaction | undefined;
  targetTokenExists: boolean;
}

const initialState: AttestState = {
  sourceChain: CHAIN_ID_SOLANA,
  sourceAsset: "",
  targetAsset:"",
  targetChain: CHAIN_ID_ETH,
  attestTx: undefined,
  signedVAAHex: undefined,
  createTx: undefined,
  targetTokenExists:false,
};

export const attestSlice = createSlice({
  name: "attest",
  initialState,
  reducers: {
    setSourceChain: (state, action: PayloadAction<ChainId>) => {
      state.sourceChain = action.payload;
      state.sourceAsset = "";
      state.targetAsset = "";
      state.targetTokenExists = false;

    },
    setSourceAsset: (state, action: PayloadAction<string>) => {
      state.sourceAsset = action.payload;
      state.targetAsset = "";
      state.targetTokenExists = false;
    },
    setTargetAsset: (state, action: PayloadAction<string>) => {
      state.targetAsset = action.payload;
    },
    setTargetChain: (state, action: PayloadAction<ChainId>) => {
      state.targetChain = action.payload;
      state.targetAsset = "";
      state.targetTokenExists = false;
      
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
    setTokenExists: (state, action: PayloadAction<boolean>) => {
      state.targetTokenExists = action.payload;

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
  setTokenExists,
  setTargetAsset,
  setSignedVAAHex,
  setCreateTx,
  reset,
} = attestSlice.actions;

export default attestSlice.reducer;
