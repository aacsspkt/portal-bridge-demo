import './App.css';

import React, {
  useEffect,
  useState,
} from 'react';

import base58 from 'bs58';
import { Wallet } from 'ethers';

import {
  ChainName,
  CHAINS,
  createPostVaaInstructionSolana,
  toChainId,
} from '@certusone/wormhole-sdk';
import * as splToken from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import { CustomDropDown } from './components/CustomDropdown';
import {
  BRIDGE_ADDRESSES,
  CONNECTION,
  RECIPIENT_WALLET_ADDRESS,
} from './constants';
import { deriveCorrespondingToken } from './functions';
import { transferTokens } from './functions/transferTokens';
import { useWallet } from './hooks/useWallet';

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const recipientTokenAccount = splToken.getAssociatedTokenAddress(
      new PublicKey(data.targetToken.value),
      RECIPIENT_WALLET_ADDRESS
    );

    const privateKey = "jowiwyr0q82hfh8W3YRDBSFQUY32312312DSDFCSFSFW"; // fake
    const signer = new Wallet(privateKey);
    const decimals = 10; // need to figure out how to get decimal value of a token in another chain
    const amount = BigInt(parseFloat(data.transferAmount.value) * decimals);
    const signedVAA = await transferTokens(data.sourceChain.value, signer, data.targetToken.value, amount, RECIPIENT_WALLET_ADDRESS.toBytes());
    const keypair = Keypair.fromSecretKey(base58.decode(process.env.REACT_APP_WALLET_SECRET_KEY as string));

    try {
      const txn = new Transaction()
        .add(
          await createPostVaaInstructionSolana(
            BRIDGE_ADDRESSES["solana"].address,
            RECIPIENT_WALLET_ADDRESS.toString(),
            Buffer.from(signedVAA.vaaBytes),
            keypair
          )
        );
      const lbh = await CONNECTION.getLatestBlockhash();
      txn.feePayer = RECIPIENT_WALLET_ADDRESS;
      txn.recentBlockhash = lbh.blockhash;
      txn.lastValidBlockHeight = lbh.lastValidBlockHeight;
      const signedTxn = await CONNECTION.sendTransaction(txn, [keypair], {
        preflightCommitment: 'processed',
        skipPreflight: false,
      });
      // need to show a toast that txn is sent
      const { value: { err } } = await CONNECTION.confirmTransaction(
        {
          signature: signedTxn,
          blockhash: lbh.blockhash,
          lastValidBlockHeight: lbh.lastValidBlockHeight
        },
        "confirmed"
      );
      if (!err) {
        // show success toast
      } else {
        console.log(err);
        // show a toast to show error;
      }
    } catch (error) {
      console.log(error);
      // need to show a toast to show error occured.
    }
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
  }, [data.sourceChain, data.sourceToken, data.targetChain])

  const [metamaskButtonText] = useState('Connect Metamask');
  const { accounts,
    walletConnected,
    network,
    connectWallet,
    disconnectWallet,
    trimWalletAddress } = useWallet();

  return (
    <div className="w-full h-screen flex flex-col">
      <nav className='w-full shadow flex items-center p-3'>
        <div className='container flex flex-row justify-between mx-auto'>
          <ul className='flex flex-row'>
            <li className="p-2 w-24 text-center hover:cursor-pointer">
              <a className="text-indigo-700 capitalize hover:text-indigo-500" href="/">transfer</a>
            </li>
            <li className="p-2 w-24 text-center hover:drop-shadow-2xl hover:cursor-pointer">
              <a className="capitalize hover:text-indigo-500" href="#">register</a>
            </li>
          </ul>
          <button className='ml-auto p-2 w-40 shadow bg-amber-500 rounded text-center'
            type='button'
            onClick={() => walletConnected ? disconnectWallet() : connectWallet()} >
            {walletConnected ? trimWalletAddress(accounts) : metamaskButtonText}
          </button>
        </div>
      </nav>
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
                onChange={handleChange}
                title='Amount'
                name='transferAmount'
                type='text' />
            </div>
            <button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 my-4 rounded text-center'>Tranfer</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;