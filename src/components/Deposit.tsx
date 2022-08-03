import * as React from 'react';

import { BigNumber } from 'ethers';

/* eslint-disable @typescript-eslint/no-unused-vars */
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

export interface IDepositProps {
}
interface TokenDepositSubmit {
  depositor: string,
  amount: string | undefined,
  nonce: string | undefined

}

interface SOLDepositSubmit {
  depositor: string,
  amount: string | undefined,
  nonce: string | undefined

}

export function Deposit(props: IDepositProps) {
  const [tokenData, setTokenData] = React.useState<TokenDepositSubmit>({
    depositor: "",
    amount: undefined,
    nonce: undefined
  })
  const [SolData, setSolData] = React.useState<SOLDepositSubmit>({
    depositor: "",
    amount: undefined,
    nonce: undefined
  });

  const handleTokenDepositSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const Amount = BigNumber.from(tokenData.amount);
    const Nonce = BigNumber.from(tokenData.nonce)
    const depositor = tokenData.depositor
    console.log("here")
    const tx = await (await process_deposit_token(Amount, depositor, Nonce)).wait();
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


  const handleTokenDepositorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenData({
      ...tokenData,
      depositor: e.target.value,

    });
  }
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setTokenData({
      ...tokenData,
      amount: e.target.value,

    });

  }
  const handleTokenNonceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenData({
      ...tokenData,
      nonce: e.target.value,

    });
  }

  const handleSOLDepositSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const depositor = SolData.depositor
    const Amount = BigNumber.from(SolData.amount);
    const Nonce = BigNumber.from(SolData.nonce)

    const tx = await (await process_deposit_sol(Amount, depositor, Nonce)).wait();
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
  const handleSOLDepositorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolData({
      ...SolData,
      depositor: e.target.value,

    });
  }
  const handleSOLAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setSolData({
      ...SolData,
      amount: e.target.value,

    });

  }
  const handleSOLNonceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolData({
      ...SolData,
      nonce: e.target.value,
    })
  }

  const {

    process_deposit_sol,
    process_deposit_token,



  } = useRelayer();

  return (
    <>
      <div className='flex justify-center gap-x-20'>
        <div className='w-96'>


          <section className='w-full p-3 h-full'>
            <div className='container flex flex-row mx-auto overflow-y-auto'>
              <form className='w-full space-y-3' onSubmit={handleTokenDepositSubmit} >
                <legend className='w-full text-3xl mt-5 mb-6'>Token Deposit </legend>

                <div className='w-full  space-y-2'>
                  <label className='text-md '>Depositor</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={tokenData.depositor}
                    onChange={handleTokenDepositorChange}
                    title='depositor'
                    name='depositor'
                    type='text' />
                </div>
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
                >Process Token Deposit</button>
              </form>
            </div>
          </section>


        </div>
        <div className='w-96'>


          <section className='w-full p-3 h-full'>
            <div className='container flex flex-row mx-auto overflow-y-auto'>
              <form className='w-full space-y-3' onSubmit={handleSOLDepositSubmit}>
                <legend className='w-full text-3xl mt-5 mb-6'> SOL Deposit </legend>



                <div className='w-full  space-y-2'>
                  <label className='text-md '>Depositor</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={SolData.depositor}
                    onChange={handleSOLDepositorChange}
                    title='depositor'
                    name='depositor'
                    type='text' />
                </div>
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
                    value={SolData.nonce}
                    onChange={handleSOLNonceChange}
                    title='Nonce'
                    name='nonce'
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
