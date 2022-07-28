import { ChainId, getOriginalAssetEth, getOriginalAssetSol, toChainName } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { Signer } from "@solana/web3.js"
import {TOKEN_BRIDGE_ADDRESS_TESTNET, CONNECTION_TESTNET as connection} from "../constants_testnet";

export async function getOriginalAsset(
    sourceChain:ChainId, 
    signer: Signer | ethers.Signer,
    wrappedTokenAddress?: string,
    mintAddress?:string
    ) {  
    console.log("Getting Original Asset Address!!");
    switch(toChainName(sourceChain)){
        case "ethereum":{
            let origin = await getOriginalAssetEth(
                            TOKEN_BRIDGE_ADDRESS_TESTNET["ethereum_goerli"].address,
                            signer as ethers.Signer,
                            wrappedTokenAddress as string,
                            "solana"
                        )
            return origin.assetAddress;
        }
        case "solana":{
            let origin = await getOriginalAssetSol(
                            connection,
                            TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
                            mintAddress as string
                        )
            return origin.assetAddress;
        }
        default:
            return null
    }
}