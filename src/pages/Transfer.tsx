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
  
  import { CustomDropDown } from '../components';
  import {
    BRIDGE_ADDRESSES,
    CONNECTION,
    RECIPIENT_WALLET_ADDRESS,
    TOKEN_BRIDGE_ADDRESS,
  } from '../constants';
  import {
    deriveCorrespondingToken,
    sendAndConfirmTransactions,
    transferTokens,
  } from '../functions';
import Navbar from '../components/Navbar';


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


export default function Transfer (props: ITransferProps) {
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

    // const recipientTokenAccount = splToken.getAssociatedTokenAddress(
    //   new PublicKey(data.targetToken.value),
    //   RECIPIENT_WALLET_ADDRESS
    // );


    const detectedProvider = await detectEthereumProvider
    const provider = new ethers.providers.Web3Provider(
      // @ts-ignore
      detectedProvider,
      "any"
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
            BRIDGE_ADDRESSES["solana"].address,
            RECIPIENT_WALLET_ADDRESS.toString(),
            Buffer.from(signedVAA.vaaBytes),
            keypair
          )
        );

      // redeem token
      const redeemTxn = await redeemOnSolana(
        CONNECTION,
        BRIDGE_ADDRESSES["solana"].address,
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


  return(
    <div className="w-full h-screen flex flex-col">
        <Navbar/>
    
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
            <button type='submit' className='p-2 w-40 shadow text-white bg-blue-500 my-4 rounded text-center'
            >Transfer</button>
          </form>
        </div>
      </section>
    </div>

  );
};


