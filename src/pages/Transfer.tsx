import React, { useEffect } from 'react';

import {
  ChainName,
  CHAINS,
  toChainName,
} from '@certusone/wormhole-sdk';

import { CustomDropDown } from '../components/CustomDropdown';
import { useTransferForm } from '../hooks/useTransferForm';
import { useAppDispatch, useAppSelector } from '../app/hooks';

interface ITransferProps {
}


export default function Transfer(props: ITransferProps) {
  const sourceChain = useAppSelector((state) => state.transfer.sourceChain);
  let sourceChains: number;
  const targetChain = useAppSelector((state) => state.transfer.targetChain)
  const targetAsset = useAppSelector((state) => state.transfer.targetAsset)
   	const amount = useAppSelector((state)=> state.transfer.amount)
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item !== "unset");

  const {
    data,
    handleSourceChainChange,
    handleSourceTokenChange,
    handleTargetChainChange,
    handleAmountChange,
    handleSubmit
  } = useTransferForm(chainList);





  return (
    <div className="w-full h-screen flex flex-col">
      <section className='w-full p-3 h-full'>
        <div className='container flex flex-row mx-auto overflow-y-auto'>
          <form className='w-full space-y-3' onSubmit={handleSubmit}>
            <legend className='w-full text-3xl mt-5 mb-6'>Token Transfer</legend>

            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Source Chain</label>
              <CustomDropDown value={toChainName(sourceChain)} onChange={handleSourceChainChange} dropdownList={chainList} />

            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Source Token</label>
              <input
                value={data.sourceToken}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Source Token'
                name='sourceToken'
                onChange={handleSourceTokenChange}
                type='text' />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Chain</label>
              <CustomDropDown value={toChainName(targetChain)} onChange={handleTargetChainChange} dropdownList={chainList} />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Token</label>
              <div   className='h-9 w-full border p-2 text-md focus:outline-none'>{targetAsset.address}</div>
             
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Amount</label>
              <input
                className='h-9 w-full border p-2 text-md focus:outline-none'
                value={amount}
                onChange={handleAmountChange}
                title='Amount'
                name='transferAmount'
                type='text' />
            </div>
            <button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 my-4 rounded text-center'
            >Transfer</button>
          </form>
          
        </div>
      </section>
     
    </div>

  );
};


