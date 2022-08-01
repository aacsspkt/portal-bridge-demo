import { ChainId } from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import { BigNumber, ethers } from 'ethers';
import * as React from 'react';
import Relayer from "../contracts/abi/Relayer.json"


export function useRelayer () {
 

    const contractAddress = "";
    const RelayerABI = JSON.stringify(Relayer);
      

    
    

    

    const wormhole= async function () {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.wormhole();
        return result 

    }

    const process_sol_stream= async function (start_time: BigNumber,  end_time:BigNumber,  amount:BigNumber,  receiver: string,  nonce:BigNumber){
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_sol_stream(start_time,  end_time,  amount,  receiver,  nonce);
        return result 
    }

    const process_token_stream=async function (start_time: BigNumber, end_time:BigNumber, amount:BigNumber, receiver: string,  nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_token_stream(start_time,  end_time,  amount,  receiver,  nonce);
        return result 
    }

    const process_sol_withdraw_stream=async function process_sol_withdraw_stream(amount:BigNumber, withdrawer: string,  nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_sol_withdraw_stream(amount, withdrawer,  nonce);
        return result 
    }

   const process_token_withdraw_stream= async function (amount:BigNumber, withdrawer: string,  nonce:BigNumber) {
    const detectedProvider = await detectEthereumProvider();
        
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
    );

        
   
    
    const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
    const result = await contract.process_token_withdraw_stream(amount, withdrawer,  nonce);
        return result 

    }

    const process_deposit_sol=async function (amount:BigNumber, depositor: string,  nonce:BigNumber) {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_deposit_sol(amount, depositor,  nonce);
        return result 



    }

    const process_deposit_token=async function (amount:BigNumber, depositor: string,  nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_deposit_token(amount, depositor,  nonce);
        return result 
 
    }

    const process_fund_sol= async function (end_time:BigNumber, amount:BigNumber, nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_fund_sol(amount, amount,  nonce);
        return result 
        

    }

    const process_fund_token = async function (end_time:BigNumber, amount:BigNumber, nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        
        const result = await contract.process_fund_token(amount, amount,  nonce);
        return result 
    }

    const process_withdraw_sol=async function (amount:BigNumber, nonce:BigNumber) {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_withdraw_sol(amount, nonce);
        return result 

    }

    const process_withdraw_token=async function (amount:BigNumber, nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_withdraw_token(amount, nonce);
        return result 

  
    }

   const  process_swap_sol= async function (amount:BigNumber, nonce:BigNumber)  {
    const detectedProvider = await detectEthereumProvider();
        
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
    );
    
    const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.process_swap_sol(amount, nonce);
        return result 


    }
  

    const encode_process_swap_token=async function (amount:BigNumber, nonce:BigNumber)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.encode_process_swap_token(amount, nonce);
        return result 

      
    }

   
    const registerApplicationContracts= async function (chainId:ChainId, applicationAddr:string)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.registerApplicationcontracts(chainId, applicationAddr);
        return result 


    }

    const receiveEncodedMsg =async function (encodedMsg:string)  {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
        const result = await contract.receiveEncodedMsg(encodedMsg);
        return result 

       
    }

    const getCurrentMsg=async function () {
        const detectedProvider = await detectEthereumProvider();
        
        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );
        
        const contract = new ethers.Contract(contractAddress, RelayerABI, provider);
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
