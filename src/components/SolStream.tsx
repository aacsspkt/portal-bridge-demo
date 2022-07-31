import { BigNumber } from 'ethers';
import * as React from 'react';
import { useRelayer } from '../hooks/useRelayer';

export interface ISOLStreamProps {
}

interface SOLWithdrawStream{
  withdrawer: string,
  amount:string ,
  nonce: string

}

interface SOLStream{
  startTime:string ,
  endTime: string,
  receiver: string,
  amount:string ,
  nonce: string

}

export function SolStream (props: ISOLStreamProps) {
  const [withdrawData, setWithdrawData] = React.useState<SOLWithdrawStream>({
    withdrawer: "",
    amount:"",
    nonce: ""
  })
  const [data, setData] = React.useState<SOLStream>({
    startTime:"",
    endTime: "",
    receiver: "",
    amount:"",
    nonce: ""
  });

  const {
 
    process_token_stream,
    process_token_withdraw_stream,


  }  = useRelayer();

  const handleSOLWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const withdrawer = withdrawData.withdrawer;
    const Amount =  BigNumber.from(withdrawData.amount);
    const Nonce =  BigNumber.from(withdrawData.nonce)
    console.log("here")


    const sequence = process_token_withdraw_stream(Amount,withdrawer,Nonce );
    
     
  }

  const handleSOLWithdrawerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawData({
      ...withdrawData,
      withdrawer: e.target.value,
    
    });
  }
  const handleSOLWithdrawAmountChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    
    setWithdrawData({
      ...withdrawData,
      amount: e.target.value,
    
    });
    
  }
  const handleSOLWithdrawNonceChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawData({
      ...withdrawData,
      nonce: e.target.value,
    
    });
  }

  const handleSOLStream = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startTime =  BigNumber.from(data.startTime);
    const endTime =  BigNumber.from(data.endTime);
    const receiver = data.receiver;
    const Amount =  BigNumber.from(data.amount);
    const Nonce =  BigNumber.from(data.nonce)

    const sequence = process_token_stream(startTime,endTime, Amount,receiver,Nonce );
    console.log("here")

    
     
  }
  const handleSOLEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      endTime: e.target.value,
    
    });
  }
  const handleSOLStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      startTime: e.target.value,
    
    });
  }
  const handleSOLReceiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      receiver: e.target.value,
    
    });
  }
  const handleSOLAmountChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    
    setData({
      ...data,
      amount: e.target.value,
    
    });
    
  }
  const handleSOLNonceChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      nonce: e.target.value,
    })}
  return (
    <>
    <div className='flex justify-center gap-x-20'>
    <div className='w-96'>


<section className='w-full p-3 h-full'>
  <div className='container flex flex-row mx-auto overflow-y-auto'>
    <form className='w-full space-y-3' onSubmit={handleSOLWithdrawSubmit}>
      <legend className='w-full text-3xl mt-5 mb-6'>SOL Withdraw Stream </legend>
             
      <div className='w-full  space-y-2'>
        <label className='text-md '>Withdrawer</label>
        <input
          value={withdrawData.withdrawer}
          onChange={handleSOLWithdrawerChange}
          className='h-9 w-full border p-2 text-md focus:outline-none'
          title='Receiver'
          disabled
          name='receiver'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Amount</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={withdrawData.amount}
          onChange={handleSOLWithdrawAmountChange}
          title='Amount'
          name='transferAmount'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Nonce</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={withdrawData.nonce}
          onChange={handleSOLWithdrawNonceChange}
          title='Nonce'
          name='nonce'
          type='text' />
      </div>
  
      <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
      >Process SOL Withdraw Stream</button>
    </form>
  </div>
</section>


</div>
      <div className='w-96'>


<section className='w-full p-3 h-full'>
  <div className='container flex flex-row mx-auto overflow-y-auto'>
    <form className='w-full space-y-3' onSubmit={handleSOLStream}>
      <legend className='w-full text-3xl mt-5 mb-6'>SOL Stream </legend>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Start Time</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.startTime}
          onChange={handleSOLStartTimeChange}
          title='StartTime'
          name='StartTime'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>End Time</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.endTime}
          onChange={handleSOLEndTimeChange}
          title='End Time'
          name='end Time'
          type='text' />
      </div>

  
      <div className='w-full  space-y-2'>
        <label className='text-md '>Receiver</label>
        <input
          value={data.receiver}
          onChange={handleSOLReceiverChange}
          className='h-9 w-full border p-2 text-md focus:outline-none'
          title='Receiver'
          disabled
          name='receiver'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Amount</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.amount}
          onChange={handleSOLAmountChange}
          title='Amount'
          name='transferAmount'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Nonce</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.nonce}
          onChange={handleSOLNonceChange}
          title='Nonce'
          name='nonce'
          type='text' />
      </div>
  
      <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
      >Process SOL Stream</button>
    </form>
  </div>
</section>
</div>
      
    </div>
    </>
  );
}
