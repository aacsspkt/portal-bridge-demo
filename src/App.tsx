import './App.css';

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

import { CustomDropDown } from './components';
import {
  BRIDGE_ADDRESS,
  CONNECTION,
  RECIPIENT_WALLET_ADDRESS,
  TOKEN_BRIDGE_ADDRESS,
} from './constants';
import {
  deriveCorrespondingToken,
  sendAndConfirmTransactions,
  transferTokens,
} from './functions';
import { useEthereumProvider } from './hooks/EthereumContextProvider';

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
      value: "solana",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const detectedProvider = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider
    );

    const signer = provider.getSigner();
    const decimals = 10; // need to figure out how to get decimal value of a token in another chain
    const amount = BigInt(parseFloat(data.transferAmount.value) * decimals);
    const signedVAA = await transferTokens(data.sourceChain.value, signer, data.targetToken.value, amount, RECIPIENT_WALLET_ADDRESS.toBytes());
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
  const {
    connect,
    disconnect,
    provider,
    chainId,
    signer,
    signerAddress,
    providerError,
    walletConnected,
    trimWalletAddress } = useEthereumProvider()

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
            onClick={() => walletConnected ? disconnect() : connect()} >
            {walletConnected ? trimWalletAddress(signerAddress) : metamaskButtonText}
          </button>
        </div>
      </nav>
      <section className='w-full p-3 h-full'>
        <div className='container flex flex-row min-h-full mx-auto overflow-y-auto'>
          <form className='w-full space-y-3' onSubmit={handleSubmit}>
            <legend className='w-full text-3xl mt-5 mb-6'>Token Transfer</legend>

            <div className='md:w-3/4 lg:w-3/5 space-y-2'>
              <label className='text-md '>Source Chain</label>
              <CustomDropDown className="" value={data.sourceChain.value} onChange={handleSourceChainChange} dropdownList={chainList} />
              {data.sourceChain.error ?? <span className='text-red-500 text-sm'>{data.sourceChain.error}</span>}
            </div>
            <div className='md:w-3/4 lg:w-3/5 space-y-2'>
              <label className='text-md '>Source Token</label>
              <input
                value={data.sourceToken.value}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Source Token'
                name='sourceToken'
                onChange={handleChange}
                type='text' />
            </div>
            <div className='md:w-3/4 lg:w-3/5 space-y-2'>
              <label className='text-md '>Target Chain</label>
              <input
                value={data.targetChain.value}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Target Chain'
                disabled
                name='targetChain'
                type='text' />
            </div>
            <div className='md:w-3/4 lg:w-3/5 space-y-2'>
              <label className='text-md '>Target Token</label>
              <input
                value={data.targetToken.value}
                className='h-9 w-full border p-2 text-md focus:outline-none'
                title='Target Token'
                disabled
                name='targetToken'
                type='text' />
            </div>
            <div className='md:w-3/4 lg:w-3/5 space-y-2'>
              <label className='text-md '>Amount</label>
              <input
                className='h-9 w-full border p-2 text-md focus:outline-none'
                value={data.transferAmount.value}
                onChange={handleChange}
                title='Amount'
                name='transferAmount'
                type='text' />
            </div>
            <div className='py-2'>
              <button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 rounded text-center'
              >Transfer</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;