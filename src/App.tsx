import React, { useEffect, useState } from 'react';
import { CustomDropDown } from './components/CustomDropdown';
import './App.css';
import { deriveSolanaToken } from "./functions";
import { CHAINS, CHAIN_ID_ETH, CHAIN_ID_TO_NAME } from '@certusone/wormhole-sdk';

function App() {
  let chainList = Object.keys(CHAINS);
  const [sourceChain, setSourceChain] = useState(chainList[0]);
  const [sourceToken, setSourceToken] = useState('');
  const [targetChain, setTargetChain] = useState(chainList[0]);
  const [targetToken, setTargetToken] = useState('');
  const [amount, setAmount] = useState('');

  // const onSourceTokenValueChange = async () => {
  //   // try {

  //   setTargetToken(targetToken.toString());
  //   // } catch (error) {

  //   // }
  //   // 
  // }


  // useEffect(() => {
  //   const targetToken = async () => {
  //     
  //     setTargetToken(targetToken.toString())
  //   }
  //   targetToken();
  // }, [sourceToken]);

  return (
    <div className="w-full p-2">
      <section className='from-to'>
        <form>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Source Chain</label>
            <CustomDropDown selected={sourceChain} setSelected={setSourceChain} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Source Token</label>
            <input
              value={sourceToken}
              className='h-9 w-full border p-2 text-md focus:outline-none'
              title='Source Token'
              name='source_token'
              onChange={async (e) => {
                setSourceToken(e.target.value);
                const targetToken = await deriveSolanaToken(sourceToken, CHAIN_ID_ETH);
                setTargetToken(targetChain);
              }}
              type='text' />
          </div>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Target Chain</label>
            <CustomDropDown selected={targetChain} setSelected={setTargetChain} dropdownList={chainList} />
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

function deriveSolanaTokenFromEth(sourceToken: string) {
  throw new Error('Function not implemented.');
}
