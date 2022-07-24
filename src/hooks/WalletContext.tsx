import { createContext, useState, useEffect } from "react";

import { EthereumTestnetConfig } from "../contracts/config"

interface contextState {
     account:string,
     connectWallet: (window:any)=>Promise<void>, 
     trimWalletAddress : (walletAddress: string | any[]) => string, 
     walletConnected : boolean, 
     disconnectWallet: ()=>void, 
     network:Object |undefined
}
 


const WalletContextData =createContext({} as contextState);


const WalletContextDataProvider = ({ children}:any ) => {
   

    const Network = EthereumTestnetConfig.mainnet;
    const Chains = Network.chainId;
 
  const [network, setNetwork] = useState<Object | undefined>("")
  const [walletConnected, setWalletConnected] = useState<boolean>(false)
  const [account, setAccounts] = useState<string>("")
 
  
  


const isMetaMaskInstalled= async (window:any)=>{
    const { ethereum }  =window;
    return Boolean(ethereum && ethereum.isMetamask);
}

const readAddress = async (window:any) => {
    try {
        const method = 'eth_requestAccounts';
        const accounts = await window.ethereum.request({ method });
        if(accounts[0]){
            return accounts[0]
            
        }
    }
    catch (error) {
        console.log('Error while reading the address!');
      }


 
}

  
  const trimWalletAddress = (walletAddress: string | any[]) => {
    return `${walletAddress?.slice(0, 6)}.....${walletAddress?.slice(
      walletAddress?.length - 6,
      walletAddress?.length - 1
    )}`
  }
  const connectWallet = async (window:any) => {
    console.log(window)
    
    const network = await readNetwork(window);
    if (network && Chains.includes(network)) {
      await readAddress(window);
    } else {
      const isSwitched = await switchNetwork(window);
      if (isSwitched) {
          const account= await readAddress(window);
          if(account!==null && account!==undefined)
          {
            setWalletConnected(true)
          setAccounts(account)
          console.log("Inisde connectWallet", account)
          }
          
      }
    }

  }
  const readNetwork = async (window:any) => {
    if (await isMetaMaskInstalled(window)) {
        try {
          const method = 'eth_chainId';
          const network = await window.ethereum.request({ method });
          setNetwork(network);
          console.log("inside readNetwork ", network)
        } catch (error) {
          console.log('Error while connecting to wallet. Please Try Again or refresh the page!');
          return null;
        }
      } else {
        console.log(
          'Metamask provider not found. Please check whether the wallet is installed or not',
        );
        return null;
      }
  

  }
  const disconnectWallet = () => {
   
    console.log("disconnect wallet")
    setWalletConnected(false)
  }

  const switchNetwork = async (window:any) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Network.chainId[0] }],
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError:any) {
      if (switchError.code === 4902) {
        const network = await addNetwork(window);
        return setNetwork(network);
        
      }
    }
  };

  const addNetwork = async (window:any) => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: Network.chainId[0],
            chainName: Network.chainName,
            rpcUrls: Network.rpcUrls,
            nativeCurrency: {
              name: Network.nativeCurrency.name,
              symbol: Network.nativeCurrency.symbol, // 2-6 characters long
              decimals: 18,
            },
          },
        ],
      });
      return true;
    } catch (addError) {
      // handle "add" error
      console.log('Error while adding the network. Please try again!');
    }
  };

   return (
     <WalletContextData.Provider value={{ account,connectWallet, trimWalletAddress , walletConnected, disconnectWallet,  network }} >
     {children}
     </WalletContextData.Provider>

    
  );
};

export { WalletContextData, WalletContextDataProvider };
