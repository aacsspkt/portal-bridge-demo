import React, { useContext, useEffect, useState } from 'react';
import { CustomDropDown } from './components/CustomDropdown';
import './App.css';
import { deriveCorrespondingToken } from "./functions";
import { CHAINS, ChainName, toChainId } from '@certusone/wormhole-sdk';
import { PublicKey } from '@solana/web3.js';
import { attestToken } from './functions/attestTokens';
import { useWallet } from './hooks/useWallet';
import { WalletContextData } from './hooks/WalletContext';

interface TokenTransferForm {
  sourceChain: {
    value: ChainName,
    error: string | null,
  },
  sourceToken: {
    value: string,
    error: string | null
  },
  targetChain: {
    value: ChainName,
    error: string | null,
  },
  targetToken: {
    value: string,
    error: string | null
  },
  transferAmount: {
    value: string,
    error: string | null
  }
}

function App() {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item !== "unset");

  const [data, setData] = useState<TokenTransferForm>({
    sourceChain: {
      value: chainList[0],
      error: null,
    },
    sourceToken: {
      value: "",
      error: null,
    },
    targetChain: {
      value: chainList[0],
      error: null,
    },
    targetToken: {
      value: "",
      error: null,
    },
    transferAmount: {
      value: "",
      error: null
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: {
        value: value,
        error: null
      }
    });
  }

  const handleSourceChainChange = async (value: string) => {
    setData({
      ...data,
      sourceChain: {
        value: value as ChainName,
        error: null
      }
    });
  }

  const handleTargetChainChange = async (value: string) => {
    setData({
      ...data,
      targetChain: {
        value: value as ChainName,
        error: null,
      }
    });
  }

  useEffect(() => {
    const getAndSetTargetToken = async () => {
      let targetToken: PublicKey | null;
      targetToken = await deriveCorrespondingToken(data.sourceToken.value, toChainId(data.sourceChain.value), toChainId(data.targetChain.value));
      if (targetToken != null) {
        setData({
          ...data,
          targetToken: {
            value: targetToken.toString(),
            error: null
          }
        });
      } else {
        // const vaaUrl = await attestToken(data.sourceChain, signer, data.sourceToken);
      }
    }

    if (data.sourceChain.value && data.sourceToken.value !== "" && data.targetChain.value) {
      getAndSetTargetToken()
    }
  }, [data.sourceChain, data.sourceToken, data.targetChain])

  const [metamaskButtonText, setMetamaskButtonText] = useState('Connect Metamask');
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [phantomButtonText, setPhantomButtonText] = useState('Connect Phantom');
  const [isPhantomConnected, setIsPhantomConnected] = useState(false);
  const { accounts,
    walletConnected,
    network,
    connectWallet,
    disconnectWallet,
    trimWalletAddress } = useWallet();

  return (
    <div className="w-full p-4">
      <section className='w-full flex flex-row mb-4 gap-4'>
        <button className='p-2 w-40 shadow bg-amber-500 rounded text-center'
          type='button'
          onClick={() => walletConnected ? disconnectWallet() : connectWallet()} >
          {walletConnected ? trimWalletAddress(accounts) : metamaskButtonText}
        </button>
        <button className='p-2 w-40 shadow bg-indigo-500 rounded text-center' type='button' >{phantomButtonText}</button>
      </section>

      <section className='from-to'>
        <form>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Source Chain</label>
            <CustomDropDown value={data.sourceChain.value} onChange={handleSourceChainChange} dropdownList={chainList} />
            {data.sourceChain.error ?? <span className='text-red-500 text-sm'>{data.sourceChain.error}</span>}
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Source Token</label>
            <input
              value={data.sourceToken.value}
              className='h-9 w-full border p-2 text-md focus:outline-none'
              title='Source Token'
              name='sourceToken'
              onChange={handleChange}
              type='text' />
          </div>
          <div className='w-1/3 mb-3'>
            <label className='text-md mb-2'>Target Chain</label>
            <CustomDropDown value={data.targetChain.value} onChange={handleTargetChainChange} dropdownList={chainList} />
          </div>
          <div className='w-1/3 mb-3 flex flex-col'>
            <label className='text-md mb-2'>Target Token</label>
            <input
              value={data.targetToken.value}
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
              value={data.transferAmount.value}
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