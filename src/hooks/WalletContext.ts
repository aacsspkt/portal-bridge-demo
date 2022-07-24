export{}// import { createContext, useState, useEffect } from "react";

// import { EthereumTestnetConfig } from "../contracts/config"



// const WalletContextData = createContext({});


// const WalletContextDataProvider = ({ children }) => {

//     const Network = EthereumTestnetConfig.mainnet;
//     const Chains = Network.chainId;
 
//   const [network, setNetwork] = useState("")
//   const [walletConnected, setWalletConnected] = useState(false)
//   const [account, setAccounts] = useState("")
  
  


// const isMetaMaskInstalled= async ()=>{
//     const { ethereum } =window;
//     return Boolean(ethereum && ethereum.isMetamask);
// }

// const readAddress = async () => {
//     try {
//         const method = 'eth_requestAccounts';
//         const accounts = await window.ethereum.request({ method });
//         if(accounts[0]){
//             return accounts[0]
            
//         }
//     }
//     catch (error) {
//         console.log('Error while reading the address!');
//       }


 
// }

  
//   const trimWalletAddress = walletAddress => {
//     return `${walletAddress?.slice(0, 6)}.....${walletAddress?.slice(
//       walletAddress?.length - 6,
//       walletAddress?.length - 1
//     )}`
//   }
//   const connectWallet = async () => {
//     const network = await readNetwork();
//     if (network && Chains.includes(network)) {
//       await readAddress();
//     } else {
//       const isSwitched = await switchNetwork();
//       if (isSwitched) {
//           const account= await readAddress();
//           if(account!==null && account!==undefined)
//           {
//             setWalletConnected(true)
//           setAccounts(account)
//           console.log("Inisde connectWallet", account)
//           }
          
//       }
//     }

//   }
//   const readNetwork = async () => {
//     if (await isMetaMaskInstalled()) {
//         try {
//           const method = 'eth_chainId';
//           const network = await window.ethereum.request({ method });
//           setNetwork(network);
//           console.log("inside readNetwork ", network)
//         } catch (error) {
//           console.log('Error while connecting to wallet. Please Try Again or refresh the page!');
//           return null;
//         }
//       } else {
//         console.log(
//           'Metamask provider not found. Please check whether the wallet is installed or not',
//         );
//         return null;
//       }
  

//   }
//   const disconnectWallet = () => {
   
//     console.log("disconnect wallet")
//     setWalletConnected(false)
//   }

//   const switchNetwork = async () => {
//     try {
//       await window.ethereum.request({
//         method: 'wallet_switchEthereumChain',
//         params: [{ chainId: Network.chainId[0] }],
//       });
//       return true;
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (switchError) {
//       if (switchError.code === 4902) {
//         const network = await addNetwork();
//         return setNetwork(network);
        
//       }
//     }
//   };

//   const addNetwork = async () => {
//     try {
//       await window.ethereum.request({
//         method: 'wallet_addEthereumChain',
//         params: [
//           {
//             chainId: Network.chainIds[0],
//             chainName: Network.networkName,
//             rpcUrls: Network.rpcs,
//             nativeCurrency: {
//               name: Network.currencySymbol,
//               symbol: Network.currencySymbol, // 2-6 characters long
//               decimals: 18,
//             },
//           },
//         ],
//       });
//       return true;
//     } catch (addError) {
//       // handle "add" error
//       console.log('Error while adding the network. Please try again!');
//     }
//   };

//   return (
//     <WalletContextData.Provider value={{ account , connectWallet, trimWalletAddress, walletConnected, disconnectWallet, network }} >

//     {children}
//     </WalletContextData.Provider>
    
//   );
// };

// export { WalletContextData, WalletContextDataProvider };
