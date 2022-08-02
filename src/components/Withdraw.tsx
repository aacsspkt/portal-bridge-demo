import { getEmitterAddressEth, getSignedVAAWithRetry, parseSequenceFromLogEth } from '@certusone/wormhole-sdk';
import { BigNumber } from 'ethers';
import * as React from 'react';
import { BRIDGE_ADDRESS_TESTNET, TOKEN_BRIDGE_ADDRESS_TESTNET, WORMHOLE_REST_ADDRESS_TESTNET } from '../constants_testnet';
import { useRelayer } from '../hooks/useRelayer';

export interface IWithdrawProps {
}
interface TokenWithdrawSubmit{

  amount:string |undefined,
  nonce: string|undefined

}

interface SOLWithdrawSubmit{

  amount:string |undefined,
  nonce: string|undefined

}


export function Withdraw (props: IWithdrawProps) {
  const [tokenData, setTokenData] = React.useState<TokenWithdrawSubmit>({
 
    amount:undefined,
    nonce:undefined
  })
  const [SolData, setSolData] = React.useState<SOLWithdrawSubmit>({
 
    amount:undefined,
    nonce:undefined
  })
  const {
 
    process_withdraw_sol,
    process_withdraw_token,


  }  = useRelayer();
  const handleTokenWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const Amount =  BigNumber.from(tokenData.amount);
    const Nonce =  BigNumber.from(tokenData.nonce)
    console.log("here")



    const tx = await(await process_withdraw_token(Amount,Nonce )).wait();
    console.log("tx",tx)
    const seq = parseSequenceFromLogEth(tx,BRIDGE_ADDRESS_TESTNET["bsc"].address);
    console.log("seq",seq);
    const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS_TESTNET["bsc"].address;
    const emitterAddress = getEmitterAddressEth(tokenBridgeAddress);
    console.log("emitter Address", emitterAddress)
    console.log("fetching Vaa")
    const { vaaBytes } = await getSignedVAAWithRetry(
      [WORMHOLE_REST_ADDRESS_TESTNET],
      "bsc",
      emitterAddress,
      seq,
    );
   

    console.log("vaa",vaaBytes)
    
    
     
  }

 
  const handleTokenAmountChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    
    setTokenData({
      ...tokenData,
      amount: e.target.value,
    
    });
    
  }
  const handleTokenNonceChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenData({
      ...tokenData,
      nonce: e.target.value,
    
    });
  }

  const handleSOLWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const Amount =  BigNumber.from(SolData.amount);
    const Nonce =  BigNumber.from(SolData.nonce)

    const tx = await(await process_withdraw_sol(Amount,Nonce )).wait();
    console.log("tx",tx)
    const seq = parseSequenceFromLogEth(tx,BRIDGE_ADDRESS_TESTNET["bsc"].address);
    console.log("seq",seq);
    const tokenBridgeAddress = TOKEN_BRIDGE_ADDRESS_TESTNET["bsc"].address;
    const emitterAddress = getEmitterAddressEth(tokenBridgeAddress);
    console.log("emitter Address", emitterAddress)
    console.log("fetching Vaa")
    const { vaaBytes } = await getSignedVAAWithRetry(
      [WORMHOLE_REST_ADDRESS_TESTNET],
      "bsc",
      emitterAddress,
      seq,
    );
   

    console.log("vaa",vaaBytes)
    

    
     
  }
 
  const handleSOLAmountChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    
    setSolData({
      ...SolData,
      amount: e.target.value,
    
    });
    
  }
  const handleSOLNonceChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolData({
      ...SolData,
      nonce: e.target.value,
    })}
  
  return (
    <>
    <div className='flex justify-center gap-x-20'>
    <div className='w-96'>


<section className='w-full p-3 h-full'>
  <div className='container flex flex-row mx-auto overflow-y-auto'>
    <form className='w-full space-y-3' onSubmit={handleTokenWithdrawSubmit}>
      <legend className='w-full text-3xl mt-5 mb-6'>Token Withdraw </legend>
             
      
      <div className='w-full  space-y-2'>
        <label className='text-md '>Amount</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={tokenData.amount}
          onChange={handleTokenAmountChange}
          title='Amount'
          name='transferAmount'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Nonce</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={tokenData.nonce}
          onChange={handleTokenNonceChange}
          title='Nonce'
          name='nonce'
          type='text' />
      </div>
  
      <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
      >Process Token Withdraw</button>
    </form>
  </div>
</section>


</div>
      <div className='w-96'>


<section className='w-full p-3 h-full'>
  <div className='container flex flex-row mx-auto overflow-y-auto'>
    <form className='w-full space-y-3' onSubmit={handleSOLWithdrawSubmit} >
      <legend className='w-full text-3xl mt-5 mb-6'>SOL Withdraw </legend>


 
      <div className='w-full  space-y-2'>
        <label className='text-md '>Amount</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={SolData.amount}
          onChange={handleSOLAmountChange}
          title='Amount'
          name='transferAmount'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Nonce</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={SolData.amount}
          onChange={handleSOLNonceChange}
          title='Nonce'
          name='nonce'
          type='text' />
      </div>
  
      <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
      >Process SOL Withdraw</button>
    </form>
  </div>
</section>
</div>
      
    </div>
    </>
  );
}