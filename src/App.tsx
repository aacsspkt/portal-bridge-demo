import { TokenBridge, Wormhole, } from '@certusone/wormhole-sdk';
import React, { useState } from 'react';
import './App.css';
import { CustomDropDown } from './components/CustomDropdown';

function App() {
  let chainList = ['solana', 'ethereums']
  let tokenList = ['4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R']
  const [sourceChain, setSourceChain] = useState(chainList[0]);
  const [sourceToken, setSourceToken] = useState(tokenList[0]);
  const [targetChain, setTargetChain] = useState(chainList[0]);
  const [amount, setAmount] = useState('');
  const [targetToken, setTargetToken] = useState('');


  // const tokenbridge = new TokenBridge();

  return (
    <div className="w-full p-2">
      <section className='from-to'>
        <form>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Source Chain</label>
            <CustomDropDown selected={sourceChain} setSelected={setSourceChain} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Source Token</label>
            <CustomDropDown selected={sourceToken} setSelected={setSourceToken} dropdownList={tokenList} />
          </div>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Target Chain</label>
            <CustomDropDown selected={targetChain} setSelected={setTargetChain} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Target Token</label>
            <input
              value={targetToken}
              onChange={(e) => setTargetToken(e.target.value)}
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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