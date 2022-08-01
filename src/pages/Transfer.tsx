import React from 'react';

import {
  ChainName,
  CHAINS,
} from '@certusone/wormhole-sdk';

import { CustomDropDown } from '../components/CustomDropdown';
import { useTransferForm } from '../hooks/useTransferForm';

interface ITransferProps {
}


export default function Transfer(props: ITransferProps) {
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
              <CustomDropDown value={data.sourceChain} onChange={handleSourceChainChange} dropdownList={chainList} />

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
              <CustomDropDown value={data.targetChain} onChange={handleTargetChainChange} dropdownList={chainList} />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Token</label>
              <input
                value={data.targetToken}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Target Token'
                disabled
                name='targetToken'
                type='text' />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Amount</label>
              <input
                className='h-9 w-full border p-2 text-md focus:outline-none'
                value={data.transferAmount}
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


