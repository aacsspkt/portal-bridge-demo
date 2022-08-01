import React, {
  useEffect,
  useState,
} from 'react';

import { ethers } from 'ethers';

import {
  ChainName,
  CHAINS,
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import { Transaction } from '@solana/web3.js';

import { CustomDropDown } from '../components/CustomDropdown';
import { KEYPAIR } from '../constants';
import {
  CONNECTION_TESTNET,
  RECIPIENT_WALLET_ADDRESS_TESTNET,
} from '../constants_testnet';
import {
  getCorrespondingToken,
  isValidToken,
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


export default function Transfer(props: ITransferProps) {
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

  const handleSourceChainChange = async (value: string) => {
    setData({
      ...data,
      sourceChain: {
        value: value as ChainName,
        error: null
      }
    });
  }

  const handleSourceTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (isValidToken(value, data.sourceChain.value)) {
      setData({
        ...data,
        sourceToken: {
          value,
          error: null
        }
      });
    } else {
      setData({
        ...data,
        sourceToken: {
          value,
          error: "Token is invalid"
        }
      })
    }
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      transferAmount: {
        value: e.target.value,
        error: null
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

    const result = await transferTokens(
      data.sourceChain.value,
      data.targetChain.value,
      provider,
      data.sourceToken.value,
      parseFloat(data.transferAmount.value),
      RECIPIENT_WALLET_ADDRESS_TESTNET.toString()
    );
    console.log("Result", result);

    const signTransaction = async (transaction: Transaction) => {
      const existingPair = transaction.signatures.filter((pair) => pair.signature !== null);
      transaction.sign(KEYPAIR);
      existingPair.forEach((pair) => {
        if (pair.signature) transaction.addSignature(pair.publicKey, pair.signature);
      });
      return transaction;
    };


  }

  useEffect(() => {
    const getAndSetTargetToken = async () => {
      try {
        console.log("Getting Target Token...")
        if (data.sourceToken.error) {
          return;
        }

        const detectedProvider = await detectEthereumProvider();

        const provider = new ethers.providers.Web3Provider(
          // @ts-ignore
          detectedProvider,
          "any"
        );

        const targetToken = await getCorrespondingToken({
          sourceChain: data.sourceChain.value,
          targetChain: data.targetChain.value,
          tokenAddress: data.sourceToken.value,
          connection: CONNECTION_TESTNET,
          signer: provider.getSigner()
        });
        console.log("targetToken:", targetToken);
        if (targetToken != null) {
          setData({
            ...data,
            targetToken: {
              value: targetToken,
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
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          setData({
            ...data,
            targetToken: {
              value: "",
              error: error.message
            }
          })
        }
      }
    }

    if (data.sourceChain.value && data.sourceToken.value !== "" && data.targetChain.value && !data.sourceToken.error) {
      getAndSetTargetToken()
    }
  }, [data.sourceChain, data.sourceToken, data.targetChain])


  return (
    <div className="w-full h-screen flex flex-col">
      <section className='w-full p-3 h-full'>
        <div className='container flex flex-row mx-auto overflow-y-auto'>
          <form className='w-full space-y-3' onSubmit={handleSubmit}>
            <legend className='w-full text-3xl mt-5 mb-6'>Token Transfer</legend>

            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Source Chain</label>
              <CustomDropDown value={data.sourceChain.value} onChange={handleSourceChainChange} dropdownList={chainList} />
              {data.sourceChain.error ?? <span className='text-red-500 text-sm'>{data.sourceChain.error}</span>}
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Source Token</label>
              <input
                value={data.sourceToken.value}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Source Token'
                name='sourceToken'
                onChange={handleSourceTokenChange}
                type='text' />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Chain</label>
              <CustomDropDown value={data.targetChain.value} onChange={handleTargetChainChange} dropdownList={chainList} />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Target Token</label>
              <input
                value={data.targetToken.value}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Target Token'
                disabled
                name='targetToken'
                type='text' />
            </div>
            <div className='w-4/5 space-y-2'>
              <label className='text-md '>Amount</label>
              <input
                className='h-9 w-full border p-2 text-md focus:outline-none'
                value={data.transferAmount.value}
                onChange={handleAmountChange}
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


