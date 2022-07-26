import * as React from 'react';
import { Link } from 'react-router-dom';
import { useEthereumProvider } from '../hooks/EthereumContextProvider';

export interface INavbarProps {
}

export default function Navbar (props: INavbarProps) {
    const [metamaskButtonText] = React.useState('Connect Metamask');
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
              <Link className="text-indigo-700 capitalize hover:text-indigo-500" to="/">transfer</Link>
            </li>
            <li className="p-2 w-24 text-center hover:drop-shadow-2xl hover:cursor-pointer">
              <Link className="capitalize hover:text-indigo-500" to="/register">register</Link>
            </li>
          </ul>
          <button className='ml-auto p-2 w-40 shadow bg-amber-500 rounded text-center'
            type='button'
            onClick={() => walletConnected ? disconnect() : connect()} >
            {walletConnected ? trimWalletAddress(signerAddress) : metamaskButtonText}
          </button>
        </div>
      </nav>
     
      
    </div>
  );
}
