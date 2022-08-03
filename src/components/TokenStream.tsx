import * as React from 'react';

import { BigNumber } from 'ethers';

import {
  getEmitterAddressEth,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk';

import {
  BSC_BRIDGE_ADDRESS,
  BSC_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import { useRelayer } from '../hooks/useRelayer';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setVaa } from '../app/slices/vaaSlice';

export interface ITokenStreamProps {
}

interface TokenWithdrawStream {
  withdrawer: string,
  amount: string,
  nonce: string

}

interface TokenStream {
  startTime: string,
  endTime: string,
  receiver: string,
  amount: string,
  nonce: string

}

export function TokenStream(props: ITokenStreamProps) {
  const vaa = useAppSelector((state)=>state.vaa.vaaValue)
  const dispatch = useAppDispatch();
  const [withdrawData, setWithdrawData] = React.useState<TokenWithdrawStream>({
    withdrawer: "",
    amount: "",
    nonce: ""
  })
  const [data, setData] = React.useState<TokenStream>({
    startTime: "",
    endTime: "",
    receiver: "",
    amount: "",
    nonce: ""
  });

  const {

    process_sol_stream,
    process_sol_withdraw_stream,


  } = useRelayer();

  const handleTokenWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const withdrawer = withdrawData.withdrawer;
    const Amount = BigNumber.from(withdrawData.amount);
    const Nonce = BigNumber.from(withdrawData.nonce)
    console.log("here")



    const tx = await (await process_sol_withdraw_stream(Amount, withdrawer, Nonce)).wait();
    console.log("tx", tx)
    const seq = parseSequenceFromLogEth(tx, BSC_BRIDGE_ADDRESS);
    console.log("seq", seq);
    const emitterAddress = getEmitterAddressEth(BSC_TOKEN_BRIDGE_ADDRESS);
    console.log("emitter Address", emitterAddress)
    console.log("fetching Vaa")
    const { vaaBytes } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      "bsc",
      emitterAddress,
      seq,
    );


    console.log("vaa", vaaBytes)


  }

  const handleTokenWithdrawerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawData({
      ...withdrawData,
      withdrawer: e.target.value,

    });
  }
  const handleTokenWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setWithdrawData({
      ...withdrawData,
      amount: e.target.value,

    });

  }
  const handleTokenWithdrawNonceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawData({
      ...withdrawData,
      nonce: e.target.value,

    });
  }

  const handleTokenStream = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startTime = BigNumber.from(data.startTime);
    const endTime = BigNumber.from(data.endTime);
    const receiver = data.receiver;
    const Amount = BigNumber.from(data.amount);
    const Nonce = BigNumber.from(data.nonce)

    const tx = await (await process_sol_stream(startTime, endTime, Amount, receiver, Nonce)).wait();
    console.log("tx", tx)
    const seq = parseSequenceFromLogEth(tx, BSC_BRIDGE_ADDRESS);
    console.log("seq", seq);
    const emitterAddress = getEmitterAddressEth(BSC_TOKEN_BRIDGE_ADDRESS);
    console.log("emitter Address", emitterAddress)
    console.log("fetching Vaa")
    const { vaaBytes } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      "bsc",
      emitterAddress,
      seq,
    );


    console.log("vaa", vaaBytes)

    dispatch(setVaa(vaaBytes))




  }
  const handleTokenEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      endTime: e.target.value,

    });
  }
  const handleTokenStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      startTime: e.target.value,

    });
  }
  const handleTokenReceiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      receiver: e.target.value,

    });
  }
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setData({
      ...data,
      amount: e.target.value,

    });

  }
  const handleTokenNonceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      nonce: e.target.value,
    })
  }
  return (
    <>
      <div className='flex justify-center gap-x-20'>
        <div className='w-96'>


          <section className='w-full p-3 h-full'>
            <div className='container flex flex-row mx-auto overflow-y-auto'>
              <form className='w-full space-y-3' onSubmit={handleTokenWithdrawSubmit}>
                <legend className='w-full text-3xl mt-5 mb-6'>Token Withdraw Stream </legend>

                <div className='w-full  space-y-2'>
                  <label className='text-md '>Withdrawer</label>
                  <input
                    value={withdrawData.withdrawer}
                    onChange={handleTokenWithdrawerChange}
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    title='withdrawer'
                    name='withdrawer'
                    type='text' />
                </div>
                <div className='w-full  space-y-2'>
                  <label className='text-md '>Amount</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={withdrawData.amount}
                    onChange={handleTokenWithdrawAmountChange}
                    title='Amount'
                    name='transferAmount'
                    type='text' />
                </div>
                <div className='w-full  space-y-2'>
                  <label className='text-md '>Nonce</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={withdrawData.nonce}
                    onChange={handleTokenWithdrawNonceChange}
                    title='Nonce'
                    name='nonce'
                    type='text' />
                </div>

                <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
                >Process Token Withdraw Stream</button>
              </form>
            </div>
          </section>


        </div>
        <div className='w-96'>

        <section className='w-full p-3 h-full'>
  <div className='container flex flex-row mx-auto overflow-y-auto'>
    <form className='w-full space-y-3' onSubmit={handleTokenStream}>
      <legend className='w-full text-3xl mt-5 mb-6'>Token Stream </legend>
      <div>VAA:</div>
        <div>{vaa}</div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Start Time</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.startTime}
          onChange={handleTokenStartTimeChange}
          title='StartTime'
          name='StartTime'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>End Time</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.endTime}
          onChange={handleTokenEndTimeChange}
          title='End Time'
          name='end Time'
          type='text' />
      </div>

  
      <div className='w-full  space-y-2'>
        <label className='text-md '>Receiver</label>
        <input
          value={data.receiver}
          onChange={handleTokenReceiverChange}
          className='h-9 w-full border p-2 text-md focus:outline-none'
          title='Receiver'
          name='receiver'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Amount</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.amount}
          onChange={handleTokenAmountChange}
          title='Amount'
          name='transferAmount'
          type='text' />
      </div>
      <div className='w-full  space-y-2'>
        <label className='text-md '>Nonce</label>
        <input
          className='h-9 w-full border p-2 text-md focus:outline-none'
          value={data.nonce}
          onChange={handleTokenNonceChange}
          title='Nonce'
          name='nonce'
          type='text' />
      </div>
  
      <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
      >Process Token Stream</button>
    </form>
  </div>
</section>
</div>
      
    </div>
    </>
  );
}
function sourceChain(arg0: string[], sourceChain: any, emitterAddress: string, seq: string): { vaaBytes: any; } | PromiseLike<{ vaaBytes: any; }> {
  throw new Error('Function not implemented.');
}





