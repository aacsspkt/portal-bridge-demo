import React, { useState } from 'react';
import { CustomDropDown } from './components/CustomDropdown';
import './App.css';
import { deriveCorrespondingToken } from "./functions";
import { CHAINS, ChainName, toChainId } from '@certusone/wormhole-sdk';

function App() {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item != "unset");

  const [sourceChain, setSourceChain] = useState(chainList[0]);
  const [sourceToken, setSourceToken] = useState('');
  const [targetChain, setTargetChain] = useState(chainList[0]);
  const [targetToken, setTargetToken] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleSourceChainChange = async (value: string) => {
    setSourceChain(value as ChainName);
    const targetToken = await deriveCorrespondingToken(sourceToken, toChainId(sourceChain), toChainId(targetChain));
    setTargetToken(targetToken.toString());
  }

  const handleSrcTokenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceToken(e.target.value);
    const targetToken = await deriveCorrespondingToken(sourceToken, toChainId(sourceChain), toChainId(targetChain));
    setTargetToken(targetToken.toString());
  };

  const handleTargetChainChange = async (value: string) => {
    setTargetChain(value as ChainName);
    const targetToken = await deriveCorrespondingToken(sourceToken, toChainId(sourceChain), toChainId(targetChain));
    setTargetToken(targetToken.toString());
  }

  const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAmount(e.target.value);
  }

  return (
    <div className="w-full p-2">
      <section className='from-to'>
        <form>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Source Chain</label>
            <CustomDropDown value={sourceChain} onChange={handleSourceChainChange} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Source Token</label>
            <input
              value={sourceToken}
              className='h-9 w-full border p-2 text-md focus:outline-none'
              title='Source Token'
              name='source_token'
              onChange={handleSrcTokenChange}
              type='text' />
          </div>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Target Chain</label>
            <CustomDropDown value={targetChain} onChange={handleTargetChainChange} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Target Token</label>
            <input
              value={targetToken}
              className='h-9 w-full border p-2 text-md focus:outline-none'
              title='Target Token'
              disabled
              name='target_token'
              type='text' />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Amount</label>
            <input
              className='h-9 w-full border p-2 text-md focus:outline-none'
              value={transferAmount}
              onChange={handleTransferAmountChange}
              title='Amount'
              name='amount'
              type='text' />
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;