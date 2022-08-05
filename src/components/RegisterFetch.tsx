import * as React from 'react';

import {
  ChainName,
  CHAINS,
  getEmitterAddressEth,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
  toChainId,
} from '@certusone/wormhole-sdk';

import {
  BSC_BRIDGE_ADDRESS,
  BSC_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import { useRelayer } from '../hooks/useRelayer';
import CustomDropDown from './CustomDropdown';

export interface IRegisterFetchProps {
}

interface RegisterChainForm {

  targetChain: ChainName,

  applicationAddresses: string,


}

interface ReceiveEncodedMessageForm {

  encodedMessage: string,


}

export function RegisterFetch(props: IRegisterFetchProps) {
  const chainList: ChainName[] = Object.keys(CHAINS).map(item => item as ChainName).filter(item => item !== "unset");
  const [data, setData] = React.useState<RegisterChainForm>({
    targetChain: chainList[0],
    applicationAddresses: "",
  });

  const [encodedMsg, setencodedMessage] = React.useState<ReceiveEncodedMessageForm>({
    encodedMessage: "",

  })


  const handleTargetChainChange = async (value: string) => {
    setData({
      ...data,
      targetChain: value as ChainName
    });
  }

  const handleApplicationAddressesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      applicationAddresses: e.target.value,

    });
  }
  const {

    registerApplicationContracts,
    receiveEncodedMsg,
    getCurrentMsg,



  } = useRelayer()

  const handleRegisterApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const chainId = toChainId(data.targetChain)
    const applicationAddresses = data.applicationAddresses

    const tx = await (await registerApplicationContracts(chainId, applicationAddresses)).wait();
    console.log("tx", tx);
    const seq = parseSequenceFromLogEth(tx, BSC_BRIDGE_ADDRESS);
    console.log("seq", seq);
    const emitterAddress = getEmitterAddressEth(BSC_TOKEN_BRIDGE_ADDRESS);
    console.log("emitter Address", emitterAddress)
    console.log("fetching Vaa")
    const { vaaBytes } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      "bsc",
      emitterAddress,
      seq,
    );


    console.log("vaa", vaaBytes)
  }

  const handleGetMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tx = await (await getCurrentMsg()).wait();
    console.log("tx", tx);
    const seq = parseSequenceFromLogEth(tx, BSC_BRIDGE_ADDRESS);
    console.log("seq", seq);
  }


  const handleReceiveEncodedMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tx = await (await getCurrentMsg()).wait();
    console.log("tx", tx);
    const seq = parseSequenceFromLogEth(tx, BSC_BRIDGE_ADDRESS);
    console.log("seq", seq);
    const emitterAddress = getEmitterAddressEth(BSC_TOKEN_BRIDGE_ADDRESS);
    console.log("emitter Address", emitterAddress)
    console.log("fetching Vaa")
    const { vaaBytes } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      "bsc",
      emitterAddress,
      seq,
    );


    console.log("vaa", vaaBytes)
  }

  const handleEncodedMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setencodedMessage({
      ...data,
      encodedMessage: e.target.value
    });

  }



  return (

    <div className='flex justify-center gap-x-20'>
      <div className='w-96'>


        <section className='w-full p-3 h-full'>
          <div className='container flex flex-row mx-auto overflow-y-auto'>
            <form className='w-full space-y-3' onSubmit={handleRegisterApplicationSubmit}>
              <legend className='w-full text-3xl mt-5 mb-6'>Token fund </legend>

              <div className='w-full  space-y-2'>
                <label className='text-md '>Chain</label>
                <CustomDropDown value={data.targetChain} onChange={handleTargetChainChange} label={chain => chain} options={chainList} />

              </div>
              <div className='w-full  space-y-2'>
                <label className='text-md '>Application Address</label>
                <input
                  className='h-9 w-full border p-2 text-md focus:outline-none'
                  value={data.applicationAddresses}
                  onChange={handleApplicationAddressesChange}
                  title='applicationAddress'
                  name='applicationAddress'
                  type='text' />
              </div>

              <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
              >Register Application</button>
            </form>
          </div>
        </section>


      </div>
      <div className='w-96'>


        <section className='w-full p-3 h-full'>
          <button className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
            onClick={() => handleGetMessage}>
            Get Current Message

          </button>

        </section>
      </div>
      <div className='w-96'>


        <section className='w-full p-3 h-full'>
          <div className='container flex flex-row mx-auto overflow-y-auto'>
            <form className='w-full space-y-3' onSubmit={handleReceiveEncodedMessage}>
              <legend className='w-full text-3xl mt-5 mb-6'>Token fund </legend>

              <div className='w-full  space-y-2'>
                <label className='text-md '>Application Address</label>
                <input
                  className='h-9 w-full border p-2 text-md focus:outline-none'
                  value={encodedMsg.encodedMessage}
                  onChange={handleEncodedMessageChange}
                  title='applicationAddress'
                  name='applicationAddress'
                  type='text' />
              </div>

              <button type='submit' className='p-2 w-full shadow text-white bg-blue-500 my-4 rounded text-center'
              >Register Application</button>
            </form>
          </div>
        </section>
      </div>

    </div>
  );
}
