import React, { useEffect, useState } from 'react';
import { CustomDropDown } from './components/CustomDropdown';
import './App.css';
import { deriveCorrespondingToken } from "./functions";
import { CHAINS, ChainName, toChainId } from '@certusone/wormhole-sdk';
import { useWallet } from './hooks/useWallet';

function App() {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item != "unset");

  const [data, setData] = useState({
    sourceChain: chainList[0],
    sourceToken: "",
    targetChain: chainList[0],
    targetToken: "",
    transferAmount: "",
    sourceAccountAddress: "",
    targetAccountAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value
    });
  }

  const handleSourceChainChange = async (value: string) => {
    setData({
      ...data,
      sourceChain: value as ChainName
    });
  }

  const handleTargetChainChange = async (value: string) => {
    setData({
      ...data,
      targetChain: value as ChainName
    });
  }

  const getAndSetTargetToken = async () => {
    const targetToken = await deriveCorrespondingToken(data.sourceToken, toChainId(data.sourceChain), toChainId(data.targetChain));
    setData({
      ...data,
      targetToken: targetToken.toString()
    });
  }

  useEffect(() => {
    if (data.sourceChain && data.sourceToken && data.targetChain) {
      getAndSetTargetToken()
    }
  }, [data.sourceChain, data.sourceToken, data.targetChain])

  const [metamaskButtonText, setMetamaskButtonText] = useState('Connect Metamask');
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [phantomButtonText, setPhantomButtonText] = useState('Connect Phantom');
  const [isPhantomConnected, setIsPhantomConnected] = useState(false);
  const {  accounts,
    walletConnected,
    network,
    connectWallet,
    disconnectWallet,
    trimWalletAddress} = useWallet();

  // useEffect(() => {
  //   first

  //   return () => {
  //     second
  //   }
  // }, [third])

  return (
    <div className="w-full p-4">
      <section className='w-full flex flex-row mb-4 gap-4'>
        <button className='p-2 w-40 shadow bg-amber-500 rounded text-center' 
        type='button'
        onClick={()=>walletConnected? disconnectWallet(): connectWallet()} >
          {walletConnected?trimWalletAddress(accounts):metamaskButtonText }
          </button>
        <button className='p-2 w-40 shadow bg-indigo-500 rounded text-center' type='button' >{phantomButtonText}</button>
      </section>

      <section className='from-to'>
        <form>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Source Chain</label>
            <CustomDropDown value={data.sourceChain} onChange={handleSourceChainChange} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Source Token</label>
            <input
              value={data.sourceToken}
              className='h-9 w-full border p-2 text-md focus:outline-none'
              title='Source Token'
              name='sourceToken'
              onChange={handleChange}
              type='text' />
          </div>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Target Chain</label>
            <CustomDropDown value={data.targetChain} onChange={handleTargetChainChange} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Target Token</label>
            <input
              value={data.targetToken}
              className='h-9 w-full border p-2 text-md focus:outline-none'
              title='Target Token'
              disabled
              name='targetToken'
              type='text' />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Amount</label>
            <input
              className='h-9 w-full border p-2 text-md focus:outline-none'
              value={data.transferAmount}
              onChange={handleChange}
              title='Amount'
              name='transferAmount'
              type='text' />
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;