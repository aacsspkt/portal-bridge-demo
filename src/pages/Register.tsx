import React, { useState } from 'react';

import { ethers } from 'ethers';

import {
  ChainName,
  CHAINS,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';

import { CustomDropDown } from '../components/CustomDropdown';
import { KEYPAIR } from '../constants';
import {
  attestToken,
  createWrappedTokens,
  getCorrespondingToken,
} from '../functions';
import { useAppDispatch } from '../app/hooks';

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
  const dispatch = useAppDispatch();

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
      let targetToken: string | null;

      do {
        await createWrappedTokens(dispatch,data.targetChain.value, KEYPAIR.publicKey.toString(), KEYPAIR, signedVAA);
        targetToken = await getCorrespondingToken({
          dispatch:dispatch,
          tokenAddress: data.sourceToken.value,
          sourceChain: data.sourceChain.value,
          targetChain: data.targetChain.value,
          signer
        }
        );
      } while (targetToken == null)

      setData({
        ...data,
        targetToken: {
          value: targetToken,
          error: null
        }
      })
      console.log("wrapped token created:", targetToken);
    } else {
      console.log("Error in token attestation");
    }
    // console.log("signedVaa", signedVAA)
  }
  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <section className='w-full p-3 h-full'>
          <div className='container flex flex-row mx-auto overflow-y-auto'>
            <form className='w-full space-y-3' onSubmit={handleSubmit}>
              <legend className='w-full text-3xl mt-5 mb-6'>Token Attestation</legend>

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
