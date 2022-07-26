import {ChainId, getIsWrappedAssetEth,getIsWrappedAssetSol, toChainName} from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { CONNECTION, SOLANA_TOKEN_BRIDGE_ADDRESS } from "../constants";

export async function isWrapped(
    sourceChainId: ChainId,
    signer:ethers.Signer,
    tokenAddress:string
    ){
    switch (toChainName(sourceChainId)) {
        case "ethereum":{
            const is_wrapped = getIsWrappedAssetEth(
                SOLANA_TOKEN_BRIDGE_ADDRESS,
                signer,
                tokenAddress,
            );
            console.log("Token Wrapped? ==> ", is_wrapped)
            return is_wrapped;
        }
    }
}