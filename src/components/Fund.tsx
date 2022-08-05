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

export interface IFundProps {
}

interface TokenFundSubmit {
  endTime: string | undefined,
  amount: string | undefined,
  sender: string 

}

interface SOLFundSubmit {
  endTime: string | undefined,
  amount: string | undefined,
  sender: string 

}


export function Fund (props: IFundProps) {
  const [tokenData, setTokenData] = React.useState<TokenFundSubmit>({
    endTime: undefined,
    amount: undefined,
    sender: ""
  })
  const [SolData, setSolData] = React.useState<SOLFundSubmit>({
    endTime: undefined,
    amount: undefined,
    sender: ""
  })
  const {

    process_fund_sol,
    process_fund_token,


  } = useRelayer()
  const handleTokenFundSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const EndTime = BigNumber.from(tokenData.endTime);
    const Amount = BigNumber.from(tokenData.amount);
    const sender = tokenData.sender
    console.log("here")


    const tx = await (await process_fund_token(EndTime, Amount, sender)).wait();
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

  const handleTokenEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenData({
      ...tokenData,
      endTime: e.target.value,

    });
  }
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setTokenData({
      ...tokenData,
      amount: e.target.value,

    });

  }
  const handleTokenSenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenData({
      ...tokenData,
      sender: e.target.value,

    });
  }

  const handleSOLFundSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const EndTime = BigNumber.from(SolData.endTime);
    const Amount = BigNumber.from(SolData.amount);
    const sender = SolData.sender;

    const tx = await (await process_fund_sol(EndTime, Amount, sender)).wait();
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
  const handleSOLEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolData({
      ...SolData,
      endTime: e.target.value,

    });
  }
  const handleSOLAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setSolData({
      ...SolData,
      amount: e.target.value,

    });

  }
  const handleSOLSenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolData({
      ...SolData,
      sender: e.target.value,
    })
  }

  return (
    <>
      <div className='flex justify-center gap-x-20'>
        <div className='w-96'>


          <section className='w-full p-3 h-full'>
            <div className='container flex flex-row mx-auto overflow-y-auto'>
              <form className='w-full space-y-3' onSubmit={handleTokenFundSubmit}>
                <legend className='w-full text-3xl mt-5 mb-6'>Token fund </legend>

                <div className='w-full  space-y-2'>
                  <label className='text-md '>End Time</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={tokenData.endTime}
                    onChange={handleTokenEndTimeChange}
                    title='endtime'
                    name='EndTime'
                    type='text' />
                </div>
                <div className='w-full  space-y-2'>
                  <label className='text-md '>Amount</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={tokenData.amount}
                    onChange={handleTokenAmountChange}
                    title='Amount'
                    name='Amount'
                    type='text' />
                </div>
                <div className='w-full  space-y-2'>
                  <label className='text-md '>Sender</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={tokenData.sender}
                    onChange={handleTokenSenderChange}
                    title='sender'
                    name='sender'
                    type='text' />
                </div>

                <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
                >Process Token Deposit</button>
              </form>
            </div>
          </section>


        </div>
        <div className='w-96'>


          <section className='w-full p-3 h-full'>
            <div className='container flex flex-row mx-auto overflow-y-auto'>
              <form className='w-full space-y-3' onSubmit={handleSOLFundSubmit} >
                <legend className='w-full text-3xl mt-5 mb-6'>SOL Fund </legend>



                <div className='w-full  space-y-2'>
                  <label className='text-md '>End Time</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={SolData.endTime}
                    onChange={handleSOLEndTimeChange}
                    title='endTime'
                    name='endTime'
                    type='text' />
                </div>
                <div className='w-full  space-y-2'>
                  <label className='text-md '>Amount</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={SolData.amount}
                    onChange={handleSOLAmountChange}
                    title='Amount'
                    name='amount'
                    type='text' />
                </div>
                <div className='w-full  space-y-2'>
                  <label className='text-md '>sender</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={SolData.sender}
                    onChange={handleSOLSenderChange}
                    title='sender'
                    name='sender'
                    type='text' />
                </div>

                <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
                >Process SOL Deposit</button>
              </form>
            </div>
          </section>
        </div>

      </div>
    </>
  );
}