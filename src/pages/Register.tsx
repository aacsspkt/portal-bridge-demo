import React, { useState } from 'react';

import base58 from 'bs58';
import { ethers } from 'ethers';

import {
  ChainName,
  CHAINS,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import { Keypair } from '@solana/web3.js';

import { CustomDropDown } from '../components/CustomDropdown';
import Navbar from '../components/Navbar';
import { RECIPIENT_WALLET_ADDRESS_TESTNET } from '../constants_testnet';
import {
  attestToken,
  createWrappedTokens,
  deriveForeignToken,
} from '../functions';

interface TokenRegisterForm {
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
}

interface IRegisterProps {
}

export default function Register(props: IRegisterProps) {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item !== "unset");
  const [tokenExists, setTokenExists] = useState<boolean>(false);


  const [data, setData] = useState<TokenRegisterForm>({
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
    }
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: {
        value: value,
        error: null
      }
    });
    console.log(name, "and ", value)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const detectedProvider = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
    );

    const signer = provider.getSigner();
    console.log("targetToken ===>", data.sourceToken.value);

    const signedVAA = await attestToken(data.sourceChain.value, signer, data.sourceToken.value);
    if (signedVAA) {
      const keypair = Keypair.fromSecretKey(base58.decode(process.env.REACT_APP_WALLET_SECRET_KEY as string));
      let targetToken: string | null;

      do {
        await createWrappedTokens(data.targetChain.value, RECIPIENT_WALLET_ADDRESS_TESTNET.toString(), keypair, signedVAA);
        targetToken = await deriveForeignToken(data.sourceToken.value, data.sourceChain.value, data.targetChain.value);
      } while (targetToken == null)

      setData({
        ...data,
        targetToken: {
          value: targetToken,
          error: null
        }
      })
    } else {
      console.log("Error in token attestation");
    }
    // console.log("signedVaa", signedVAA)
  }
  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <Navbar />

        <section className='w-full p-3 h-full'>
          <div className='container flex flex-row mx-auto overflow-y-auto'>
            <form className='w-full space-y-3' onSubmit={handleSubmit}>
              <legend className='w-full text-3xl mt-5 mb-6'>Token Transfer</legend>

              <div className='w-2/5 space-y-2'>
                <label className='text-md '>Source Chain</label>
                <CustomDropDown className="" value={data.sourceChain.value} onChange={handleSourceChainChange} dropdownList={chainList} />
                {data.sourceChain.error ?? <span className='text-red-500 text-sm'>{data.sourceChain.error}</span>}
              </div>
              <div className='w-2/5 space-y-2'>
                <label className='text-md '>Source Token</label>
                <input
                  value={data.sourceToken.value}
                  className='h-9 w-full border p-2 text-md focus:outline-none'
                  title='Source Token'
                  name='sourceToken'
                  onChange={handleChange}
                  type='text' />
              </div>
              <div className='w-2/5 space-y-2'>
                <label className='text-md '>Target Chain</label>
                <CustomDropDown value={data.targetChain.value} onChange={handleTargetChainChange} dropdownList={chainList} />
              </div>

              {!tokenExists && (<button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 my-4 rounded text-center'>
                Register
              </button>)}
            </form>
          </div>
        </section>
      </div>
    </>)
};
