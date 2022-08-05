import { ChainId } from '@certusone/wormhole-sdk';
import { BigNumber, ethers } from 'ethers';
import * as React from 'react';
import Messenger from "../contracts/abi/Messenger.json"
import { useEthereumProvider } from './EthereumContextProvider';


export function useRelayer () {
  const {
    signer
  } = useEthereumProvider();
 

    const contractAddress = process.env.REACT_APP_RELAYER_CONTRACT_ADDRESS?process.env.REACT_APP_RELAYER_CONTRACT_ADDRESS:""
    const MessengerABI = Messenger.abi;
 

    const wormhole= async function () {

        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.wormhole();
        return result 

    }

     const sendMsg= async function(str:string) {
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.sendMsg(str);
        return result 
    }

    const process_sol_stream= async function (start_time: BigNumber,  end_time:BigNumber,  amount:BigNumber,  receiver: string,  sender:string){
       
        console.log("inside")
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        console.log("inside", start_time,end_time,amount,receiver, sender)
        
        const result = await contract.process_sol_stream(start_time,  end_time,  amount,  receiver,  sender);

        return result 
    }

    const process_token_stream=async function (start_time: BigNumber, end_time:BigNumber, amount:BigNumber, receiver: string, sender:string)  {
      
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_token_stream(start_time,  end_time,  amount,  receiver,  sender);
        return result 
    }

    const process_sol_withdraw_stream=async function process_sol_withdraw_stream(amount:BigNumber, withdrawer: string)  {
        
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_sol_withdraw_stream(amount, withdrawer);
        return result 
    }

   const process_token_withdraw_stream= async function (amount:BigNumber, withdrawer: StringConstructor) {
   
    const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
    const result = await contract.process_token_withdraw_stream(amount, withdrawer);
        return result 

    }

    const process_deposit_sol=async function (amount:BigNumber, depositor: string) {
       
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_deposit_sol(amount, depositor);
        return result 



    }

    const process_deposit_token=async function (amount:BigNumber, depositor: string)  {
   
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_deposit_token(amount, depositor);
        return result 
 
    }

    const process_fund_sol= async function (end_time:BigNumber, amount:BigNumber, sender:string)  {
      
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_fund_sol(amount, amount,  sender);
        return result 
        

    }

    const process_fund_token = async function (end_time:BigNumber, amount:BigNumber, sender:string)  {

        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        
        const result = await contract.process_fund_token(amount, amount,  sender);
        console.log(result)
        return result 
    }

    const process_withdraw_sol=async function (amount:BigNumber, sender:string) {
     
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_withdraw_sol(amount, sender);
        return result 

    }

    const process_withdraw_token=async function (amount:BigNumber, sender:string)  {
     
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_withdraw_token(amount, sender);
        return result 

  
    }

   const  process_swap_sol= async function (amount:BigNumber, sender:string)  {
 
    
    const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.process_swap_sol(amount, sender);
        return result 


    }
  

    const encode_process_swap_token=async function (amount:BigNumber, sender:string)  {
    
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.encode_process_swap_token(amount, sender);
        return result 

      
    }

   
    const registerApplicationContracts= async function (chainId:ChainId, applicationAddr:string)  {
  
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.registerApplicationcontracts(chainId, applicationAddr);
        return result 


    }

    const receiveEncodedMsg =async function (encodedMsg:string)  {
     
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.receiveEncodedMsg(encodedMsg);
        return result 

       
    }

    const getCurrentMsg=async function () {
       
        
        const contract = new ethers.Contract(contractAddress, MessengerABI, signer);
        const result = await contract.getCurrentMsg();
        return result 
        
    }

    

  return {
      wormhole,
      sendMsg,
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
