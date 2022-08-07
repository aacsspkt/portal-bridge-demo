import * as React from 'react';

import { NavLink } from 'react-router-dom';

import { useEthereumProvider } from '../contexts/EthereumContextProvider';

export interface INavbarProps {
}

const Navbar = (props: INavbarProps) => {
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
    <div className="w-full flex flex-col">
      <nav className='w-full shadow flex items-center p-3'>
        <div className='container flex flex-row justify-between mx-auto'>
          <ul className='flex flex-row'>
            <li className="p-2 w-24 text-center hover:cursor-pointer">
              <NavLink className={({ isActive }) => `${isActive ? 'text-indigo-800' : ''} capitalize hover:text-indigo-500`} to="/">transfer</NavLink>
            </li>
            <li className="p-2 w-24 text-center hover:drop-shadow-2xl hover:cursor-pointer">
              <NavLink className={({ isActive }) => `${isActive ? 'text-indigo-800' : ''} capitalize hover:text-indigo-500`} to="/register">register</NavLink>
            </li>
            <li className="p-2 w-24 text-center hover:drop-shadow-2xl hover:cursor-pointer">
              <NavLink className={({ isActive }) => `${isActive ? 'text-indigo-800' : ''} capitalize hover:text-indigo-500`} to="/stream">stream</NavLink>
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

export default Navbar