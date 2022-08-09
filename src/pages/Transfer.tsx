import React from 'react';

import {
  ChainName,
  CHAINS,
  toChainName,
} from '@certusone/wormhole-sdk';

import CustomDropDown from '../components/CustomDropdown';
import useCheckIfWormholeWrapped from '../hooks/useCheckIfWormholeWrapped';
import useFetchTargetAsset from '../hooks/useFetchTargetAsset';
import useGetAvailableTokens from '../hooks/useGetSourceParsedTokenAccounts';
import useGetSourceWalletAddress from '../hooks/useGetSourceWalletAddress';
import useGetTargetParsedTokenAccounts
  from '../hooks/useGetTargetParsedTokenAccounts';
import useTransferForm from '../hooks/useTransferForm';

interface ITransferProps {
}


export default function Transfer(props: ITransferProps) {
  useGetSourceWalletAddress();
  useGetAvailableTokens();
  useCheckIfWormholeWrapped();
  useFetchTargetAsset();
  useGetTargetParsedTokenAccounts();

  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item === "solana" || item === "ethereum");

  const {
    sourceChain,
    targetChain,
    sourceParsedTokenAccounts,
    sourceParsedTokenAccount,
    targetAsset,
    amount,
    isAmountDisabled,
    handleSourceChainChange,
    handleSourceTokenAccountChange,
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
              <CustomDropDown value={toChainName(sourceChain)} onChange={handleSourceChainChange} label={(chain) => chain} options={chainList} />

            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Source Token</label>
              <CustomDropDown value={sourceParsedTokenAccount} onChange={handleSourceTokenAccountChange} label={(account) => account?.mintKey || account?.amount} options={sourceParsedTokenAccounts.data ?? []} />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Chain</label>
              <CustomDropDown value={toChainName(targetChain)} onChange={handleTargetChainChange} label={(chain) => chain} options={chainList} />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Token</label>
              <div className='h-9 w-full border p-2 text-md focus:outline-none'>{targetAsset.data?.address}</div>

            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Amount</label>
              <input
                disabled={isAmountDisabled}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
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


