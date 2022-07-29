import { ChainId } from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import { BigNumber, ethers } from 'ethers';
import * as React from 'react';
import Relayer from "../contracts/abi/Relayer.json"


export default async function useRelayer () {
    

    const detectedProvider = await detectEthereumProvider();
    const contractAddress = ""
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
    );
    const RelayerABI = JSON.stringify(Relayer);
    const contract = new ethers.Contract(contractAddress, RelayerABI, provider);

    async function wormhole() {
        const result = await contract.wormhole();
        return result 

    }

    async function process_sol_stream(start_time: BigNumber,  end_time:BigNumber,  amount:BigNumber,  receiver: string,  nonce:BigNumber){
        
        const result = await contract.process_sol_stream(start_time,  end_time,  amount,  receiver,  nonce);
        return result 
    }

    async function process_token_stream(start_time: BigNumber, end_time:BigNumber, amount:BigNumber, receiver: string,  nonce:BigNumber)  {
        const result = await contract.process_token_stream(start_time,  end_time,  amount,  receiver,  nonce);
        return result 
    }

    async function process_sol_withdraw_stream(amount:BigNumber, withdrawer: string,  nonce:BigNumber)  {

        const result = await contract.process_sol_withdraw_stream(amount, withdrawer,  nonce);
        return result 
    }

    async function process_token_withdraw_stream(amount:BigNumber, withdrawer: string,  nonce:BigNumber) {
        const result = await contract.process_token_withdraw_stream(amount, withdrawer,  nonce);
        return result 

    }

    async function process_deposit_sol(amount:BigNumber, depositor: string,  nonce:BigNumber) {
        const result = await contract.process_deposit_sol(amount, depositor,  nonce);
        return result 



    }

    async function process_deposit_token(amount:BigNumber, depositor: string,  nonce:BigNumber)  {
        const result = await contract.process_deposit_token(amount, depositor,  nonce);
        return result 
 
    }

    async function process_fund_sol(end_time:BigNumber, amount:BigNumber, nonce:BigNumber)  {
        const result = await contract.process_fund_sol(amount, amount,  nonce);
        return result 
        

    }

    async function process_fund_token(end_time:BigNumber, amount:BigNumber, nonce:BigNumber)  {
        
        const result = await contract.process_fund_token(amount, amount,  nonce);
        return result 
    }

    async function process_withdraw_sol(amount:BigNumber, nonce:BigNumber) {
        const result = await contract.process_withdraw_sol(amount, nonce);
        return result 

    }

    async function process_withdraw_token(amount:BigNumber, nonce:BigNumber)  {
        const result = await contract.process_withdraw_token(amount, nonce);
        return result 

  
    }

    async function process_swap_sol(amount:BigNumber, nonce:BigNumber)  {
        const result = await contract.process_swap_sol(amount, nonce);
        return result 


    }

    async function encode_process_swap_token(amount:BigNumber, nonce:BigNumber)  {
        const result = await contract.encode_process_swap_token(amount, nonce);
        return result 

      
    }

   
    async function registerApplicationContracts(chainId:ChainId, applicationAddr:string)  {
        const result = await contract.registerApplicationContracts(chainId, applicationAddr);
        return result 


    }

    async function receiveEncodedMsg(encodedMsg:string)  {
        const result = await contract.receiveEncodedMsg(encodedMsg);
        return result 

       
    }

    async function getCurrentMsg() {
        const result = await contract.getCurrentMsg();
        return result 
        
    }

    

  return {
    wormhole,
    process_sol_stream,
    process_token_stream,
    process_sol_withdraw_stream,
    process_token_withdraw_stream,
    process_deposit_sol,
    process_deposit_token,
    process_fund_sol,
    process_fund_token,
    process_withdraw_sol,
    process_withdraw_token,
    process_swap_sol,
    encode_process_swap_token,
    registerApplicationContracts,
    receiveEncodedMsg,
    getCurrentMsg

  }  
}
