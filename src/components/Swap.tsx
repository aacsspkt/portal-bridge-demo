import { BigNumber } from 'ethers';
import * as React from 'react';
import { useRelayer } from '../hooks/useRelayer';

export interface ISwapProps {
}
interface TokenSwapSubmit{

  amount:string |undefined,
  nonce: string|undefined

}

interface SOLSwapSubmit{

  amount:string |undefined,
  nonce: string|undefined

}


export function Swap (props: ISwapProps) {
  const [tokenData, setTokenData] = React.useState<TokenSwapSubmit>({
 
    amount:undefined,
    nonce:undefined
  })
  const [SolData, setSolData] = React.useState<SOLSwapSubmit>({
 
    amount:undefined,
    nonce:undefined
  })
  const {
 
    process_swap_sol,
    encode_process_swap_token,


  }  = useRelayer();
  const handleTokenSwapSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const Amount =  BigNumber.from(tokenData.amount);
    const Nonce =  BigNumber.from(tokenData.nonce)
    console.log("here")


    encode_process_swap_token(Amount,Nonce );
    
     
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

  const handleSOLSwapSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const Amount =  BigNumber.from(SolData.amount);
    const Nonce =  BigNumber.from(SolData.nonce)

    process_swap_sol(Amount,Nonce );
    console.log("here")

    
     
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
    <form className='w-full space-y-3' onSubmit={handleTokenSwapSubmit}>
      <legend className='w-full text-3xl mt-5 mb-6'>Token Swap </legend>
             
      
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
      >Process Token Swap</button>
    </form>
  </div>
</section>


</div>
      <div className='w-96'>


<section className='w-full p-3 h-full'>
  <div className='container flex flex-row mx-auto overflow-y-auto'>
    <form className='w-full space-y-3' onSubmit={handleSOLSwapSubmit} >
      <legend className='w-full text-3xl mt-5 mb-6'>SOL Swap </legend>


 
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
      >Process SOL Swap</button>
    </form>
  </div>
</section>
</div>
      
    </div>
    </>
  );
}