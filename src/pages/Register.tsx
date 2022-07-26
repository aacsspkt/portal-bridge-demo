import React, {
  useEffect,
  useState,
} from 'react';

import base58 from 'bs58';
import { ethers } from 'ethers';

import {
  ChainName,
  CHAINS,
  createPostVaaInstructionSolana,
  redeemOnSolana,
  toChainId,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import {
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import { CustomDropDown } from '../components/CustomDropdown';
import Navbar from '../components/Navbar';
import {
  BRIDGE_ADDRESS,
  CONNECTION,
  RECIPIENT_WALLET_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
} from '../constants';
import {
  attestToken,
  deriveCorrespondingToken,
  sendAndConfirmTransactions,
  transferTokens,
} from '../functions';

interface ITransferProps {
}

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

interface IRegisterProps {
}

export default function Register (props: IRegisterProps) {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item !== "unset");
  const [tokenExists,setTokenExists] = useState<boolean>(false);


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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const detectedProvider = await detectEthereumProvider
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
    );

    const signer = provider.getSigner();
    const decimals = 10; // need to figure out how to get decimal value of a token in another chain
    const signedVAA = await attestToken(data.sourceChain.value, toChainId(data.sourceChain.value), signer, data.sourceToken.value);
    console.log("signedVaa", signedVAA)
    const keypair = Keypair.fromSecretKey(base58.decode(process.env.REACT_APP_WALLET_SECRET_KEY as string));

    try {
      //post vaa
      const postVaaTxn = new Transaction()
        .add(
          await createPostVaaInstructionSolana(
            BRIDGE_ADDRESS["solana"].address,
            RECIPIENT_WALLET_ADDRESS.toString(),
            Buffer.from(signedVAA.vaaBytes),
            keypair
          )
        );

      // redeem token
      const redeemTxn = await redeemOnSolana(
        CONNECTION,
        BRIDGE_ADDRESS["solana"].address,
        TOKEN_BRIDGE_ADDRESS["solana"].address,
        RECIPIENT_WALLET_ADDRESS.toString(),
        signedVAA.vaaBytes
      );

      await sendAndConfirmTransactions(CONNECTION, [postVaaTxn, redeemTxn], keypair);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const getAndSetTargetToken = async () => {
      let targetToken: PublicKey | null;
     

      targetToken = await deriveCorrespondingToken(data.sourceToken.value, toChainId(data.sourceChain.value), toChainId(data.targetChain.value));
      if (targetToken != null) {
        setTokenExists(true)
        setData({
          ...data,
          targetToken: {
            value: targetToken.toString(),
            error: null
          }
        });
      } else {
        setData({
          ...data,
          targetToken: {
            value: "",
            error: "This token is not registered."
          }
        })
      }
    }

    if (data.sourceChain.value && data.sourceToken.value !== "" && data.targetChain.value) {
      getAndSetTargetToken()
    }
  }, [data])
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
              
              {tokenExists && (<><div className='w-2/5 space-y-2'>
                  <label className='text-md '>Target Token</label>
                  <input
                    value={data.targetToken.value}
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    title='Target Token'
                    disabled
                    name='targetToken'
                    type='text' />
                </div>
                <div className='w-2/5 space-y-2'>
                  <label className='text-md '>Amount</label>
                  <input
                    className='h-9 w-full border p-2 text-md focus:outline-none'
                    value={data.transferAmount.value}
                    onChange={handleChange}
                    title='Amount'
                    name='transferAmount'
                    type='text' />
                </div></>)}


                
                {!tokenExists && (<button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 my-4 rounded text-center'>
                  Register
                  </button>)}
          </form>
        </div>
      </section>
    </div>

    
  
  </>)
};
