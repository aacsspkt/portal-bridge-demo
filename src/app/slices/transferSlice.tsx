import { ChainId, CHAIN_ID_ETH, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { createSlice, PayloadAction} from "@reduxjs/toolkit"
import { DataWrapper, getEmptyDataWrapper } from "./helpers";


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
      isSourceAssetWormholeWrapped: boolean | undefined;
  originChain: ChainId | undefined;
  originAsset: string | undefined;
  sourceWalletAddress: string | undefined;
  sourceParsedTokenAccount: ParsedTokenAccount | undefined;
  sourceParsedTokenAccounts: DataWrapper<ParsedTokenAccount[]>;
  amount: string;

  targetAddressHex: string | undefined;
  targetAsset: DataWrapper<ForeignAssetInfo>;
  targetParsedTokenAccount: ParsedTokenAccount | undefined;
    
}

const initialState: TransferState = {
    sourceChain: CHAIN_ID_SOLANA,
    targetChain: CHAIN_ID_ETH,
}

export const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    setSourceChain: (state, action: PayloadAction<ChainId>) => {
      const prevSourceChain = state.sourceChain;
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
        state.targetChain = prevSourceChain;
      }
    },
  }

})



export const { setSourceChain,  } =
  transferSlice.actions

export default transferSlice.reducer
