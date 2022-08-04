import { ETH_BRIDGE_ADDRESS, ETH_TOKEN_BRIDGE_ADDRESS, KEYPAIR, WORMHOLE_RPC_HOSTS } from '../constants';
import {
  attestToken,
  getCorrespondingToken,
} from '../functions';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import React, { useCallback, useEffect, useState } from 'react';

import { ethers } from 'ethers';

import {
    attestFromEth,
  ChainName,
  CHAINS,
  CHAIN_ID_ALGORAND,
  CHAIN_ID_SOLANA,
  getEmitterAddressEth,
  getSignedVAAWithRetry,
  hexToUint8Array,
  isEVMChain,
  isTerraChain,
  parseSequenceFromLogEth,
  toChainId,
  toChainName,
  uint8ArrayToHex,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import { setAttestTx, setCreateTx, setSignedVAAHex, setSourceAsset, setSourceChain, setTargetAsset, setTargetChain, setTokenExists } from '../app/slices/attestSlice';
import { AppDispatch } from '../app/store';
import { useSnackbar } from 'notistack';
import Alert from '../components/Alert';
import { createWrappedTokens } from '../functions/createWrapped';

async function evm(
    dispatch: AppDispatch,
    enqueueSnackbar: any,
    signer: ethers.Signer,
    tokenAddress: string,
    sourceChain: ChainName
) { 

	console.log("Attesting token");
	const tokenAttestation = await attestFromEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, tokenAddress);
	dispatch(
      setAttestTx({ id: tokenAttestation.transactionHash, block: tokenAttestation.blockNumber })
    );
    enqueueSnackbar(null, {
      content: Alert({ severity: "success", children: "Transaction confirmed" }),
    });
    console.log("token attest txn hash:", tokenAttestation.transactionHash);
	const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
	console.log("fetching vaa");
	console.log("emitterAddress:", emitterAddress);
	const sequence = parseSequenceFromLogEth(tokenAttestation, ETH_BRIDGE_ADDRESS);
    console.log("sequence:", sequence);
    
	const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, sourceChain, emitterAddress, sequence);
    console.log("vaa:", vaaBytes.toString());
    dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
      enqueueSnackbar(null, {
			content: Alert({ severity: "success", children: "Fetched Signed VAA" }),
		});


}


export function useAttest() {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item !== "unset");

     const { enqueueSnackbar } = useSnackbar();
    const dispatch = useAppDispatch();
    const sourceChain = useAppSelector((state) => state.attest.sourceChain)
	const targetChain = useAppSelector((state) => state.attest.targetChain)
    const sourceToken = useAppSelector((state) => state.attest.sourceAsset)
     const targetToken = useAppSelector((state) => state.attest.targetAsset)
    const signedVAA = useAppSelector((state) => state.attest.signedVAAHex)
    const tokenExists = useAppSelector((state) => state.attest.targetTokenExists)
	

  const handleChange = useCallback(
		(event: any) => {
          console.log(event.target.value)
      dispatch(setSourceAsset(event.target.value));
    },
    [dispatch]
  );

  const handleSourceChainChange = useCallback(
		(event: any) => {
			console.log(event)
      dispatch(setSourceChain(toChainId(event)));
    },
    [dispatch]
  );

  const handleTargetChainChange = useCallback(
		(event: any) => {
			console.log(event)
      dispatch(setTargetChain(toChainId(event)));
    },
    [dispatch]
  );
    
    useEffect(() => {
    const getAndSetTargetToken = async () => {
        
        const detectedProvider = await detectEthereumProvider();
				const provider = new ethers.providers.Web3Provider(
					// @ts-ignore
					detectedProvider,
					"any",
				);
     

      const targetToken = await  getCorrespondingToken({
						dispatch: dispatch,
						sourceChain: toChainName(sourceChain),
						targetChain: toChainName(targetChain),
						tokenAddress: sourceToken,
						signer: provider.getSigner(),
      });
        
        console.log(targetToken)
        if (targetToken != null) {
            dispatch(setTargetAsset(targetToken))
            dispatch(setTokenExists(true))
          
        
        
        } 
        
    }

    if (toChainName(sourceChain) && sourceToken !== "" && targetChain) {
      getAndSetTargetToken()
    }
  }, [sourceToken,sourceChain,targetChain,targetToken,dispatch])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const detectedProvider = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
    );

    const signer = provider.getSigner();
    console.log("targetToken ===>", sourceToken);

     if (isEVMChain(sourceChain) && !!signer) {
      evm(dispatch, enqueueSnackbar, signer, sourceToken, toChainName(sourceChain));
    } 
  
    if (signedVAA) {
      let targetAsset: string | null;
        
      do {
        await createWrappedTokens(dispatch,toChainName(targetChain), KEYPAIR.publicKey.toString(), KEYPAIR, hexToUint8Array(signedVAA));
        targetAsset = await getCorrespondingToken({
          dispatch:dispatch,
          tokenAddress: sourceToken,
          sourceChain: toChainName(sourceChain),
          targetChain: toChainName(targetChain),
          signer
        }
        );
      } while (targetAsset == null)
        

      dispatch(setTargetAsset(targetAsset))
      console.log("wrapped token created:", targetAsset);
    } else {
      console.log("Error in token attestation");
    }
    // console.log("signedVaa", signedVAA)
  }
    
    return {
        sourceChain,
        targetChain,
        targetToken,
        sourceToken,
        chainList,
        tokenExists,
        handleChange,
        handleSourceChainChange,
        handleTargetChainChange,
        handleSubmit
  }
}

