import React from 'react';

import { toChainName } from '@certusone/wormhole-sdk';

import CustomDropDown from '../components/CustomDropdown';
import { useAttest } from '../hooks/useAttest';
import useFetchTargetAsset from '../hooks/useFetchTargetAsset';
import { useAppSelector } from '../app/hooks';
import useFetchForeignAsset from '../hooks/useFetchForeignAsset';

interface IRegisterProps {
}

export default function Register(props: IRegisterProps) {
  
  
  const {
    chainList,
    handleChange,
    handleSourceChainChange,
    handleTargetChainChange,
    handleSubmit
  } = useAttest();

  const sourceChain = useAppSelector((state) => state.attest.sourceChain);
	const targetChain = useAppSelector((state) => state.attest.targetChain);
	const sourceToken = useAppSelector((state) => state.attest.sourceAsset);
	const targetToken = useAppSelector((state) => state.attest.targetAsset); 
  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <section className='w-full p-3 h-full'>
          <div className='container flex flex-row mx-auto overflow-y-auto'>
            <form className='w-full space-y-3' onSubmit={handleSubmit}>
              <legend className='w-full text-3xl mt-5 mb-6'>Token Attestation</legend>

              <div className='w-2/5 space-y-2'>
                <label className='text-md '>Source Chain</label>
                <CustomDropDown className="" value={toChainName(sourceChain)} onChange={handleSourceChainChange} label={chain => chain} options={chainList} />

              </div>
              <div className='w-2/5 space-y-2'>
                <label className='text-md '>Source Token</label>
                <input
                  value={sourceToken}
                  className='h-9 w-full border p-2 text-md focus:outline-none'
                  title='Source Token'
                  name='sourceToken'
                  onChange={handleChange}
                  type='text' />
              </div>
              <div className='w-2/5 space-y-2'>
                <label className='text-md '>Target Chain</label>
                <CustomDropDown value={toChainName(targetChain)} onChange={handleTargetChainChange} label={chain => chain} options={chainList} />
              </div>
              {targetToken.data?.doesExist && (
                <div>
                
                  Wrapped Token: {targetToken.data.address}
                </div>
              )}

              {!targetToken.data?.doesExist && (<button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 my-4 rounded text-center'>
                Register
              </button>)}
            </form>
          </div>
        </section>
      </div>
    </>)
};
