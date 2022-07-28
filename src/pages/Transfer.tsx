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
} from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import {
  Keypair,
  Transaction,
} from '@solana/web3.js';

import { CustomDropDown } from '../components/CustomDropdown';
import Navbar from '../components/Navbar';
import {
  BRIDGE_ADDRESS_TESTNET,
  CONNECTION_TESTNET,
  RECIPIENT_WALLET_ADDRESS_TESTNET,
  TOKEN_BRIDGE_ADDRESS_TESTNET,
} from '../constants_testnet';
import {
  deriveForeignToken,
  sendAndConfirmTransactions,
  transferTokens,
} from '../functions';
import * as minAbi from "../contracts/abi/minAbi.json"

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
    // TODO: validate sourceToken if it is valid
    setData({
      ...data,
      sourceToken: {
        value: e.target.value,
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
    const minABI = [
      {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "decimals", type: "uint8" }],
        type: "function",
    },
   ];



    const signer = provider.getSigner();
    const contract = new ethers.Contract(data.sourceToken.value,minABI,provider)
    const decimals = await contract.decimals();
    console.log(decimals) // need to figure out how to get decimal value of a token in another chain
    const amount = ethers.utils.parseUnits(data.transferAmount.value, decimals)
    console.log(amount)
    const signedVAA = await transferTokens(data.sourceChain.value, signer, data.sourceToken.value, amount, RECIPIENT_WALLET_ADDRESS_TESTNET.toBytes());
    console.log("signedVaa", signedVAA)
    const keypair = Keypair.fromSecretKey(base58.decode(process.env.REACT_APP_WALLET_SECRET_KEY as string));

    try {
      //post vaa
      const postVaaTxn = new Transaction()
        .add(
          await createPostVaaInstructionSolana(
            BRIDGE_ADDRESS_TESTNET["solana"].address,
            RECIPIENT_WALLET_ADDRESS_TESTNET.toString(),
            Buffer.from(signedVAA.vaaBytes),
            keypair
          )
        );

      // redeem token
      const redeemTxn = await redeemOnSolana(
        CONNECTION_TESTNET,
        BRIDGE_ADDRESS_TESTNET["solana"].address,
        TOKEN_BRIDGE_ADDRESS_TESTNET["solana"].address,
        RECIPIENT_WALLET_ADDRESS_TESTNET.toString(),
        signedVAA.vaaBytes
      );

      await sendAndConfirmTransactions(CONNECTION_TESTNET, [postVaaTxn, redeemTxn], RECIPIENT_WALLET_ADDRESS_TESTNET, [keypair]);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const getAndSetTargetToken = async () => {
      try {
        // TODO: check source if it is already wrapped token

        if (data.sourceToken.error) {
          return;
        }

        const targetToken = await deriveForeignToken(data.sourceToken.value, data.sourceChain.value, data.targetChain.value);

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

    if (data.sourceChain.value && data.sourceToken.value !== "" && data.targetChain.value) {
      getAndSetTargetToken()
    }
  }, [data.sourceChain.value, data.sourceToken.value, data.targetChain.value])


  return (
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
                onChange={handleSourceTokenChange}
                type='text' />
            </div>
            <div className='w-2/5 space-y-2'>
              <label className='text-md '>Target Chain</label>
              <CustomDropDown value={data.targetChain.value} onChange={handleTargetChainChange} dropdownList={chainList} />
            </div>
            <div className='w-2/5 space-y-2'>
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


