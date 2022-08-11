# Portal Bridge Demo

The application makes use of to register tokens of one chain to another. Here registering tokens from EVM to solana and vice versa are implemented. The application can also transfer tokens from one chain to another. It makes use of wormhole sdk to implement these functionalites

wormhole-sdk: https://github.com/certusone/wormhole/tree/dev.v2

The application referred the bridge_ui repo of wormhole. 
bridge_ui: https://github.com/certusone/wormhole/tree/dev.v2/bridge_ui

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup application

### Environment Variables
Make an .env file, the .env file will require folowwing varibales

| Environment Variable Names  | Descriptions |
| ------------- | ------------- |
| REACT_APP_WALLET_SECRET_KEY  | Private key of the solana wallet |
| REACT_APP_CLUSTER  | cluster of the solana network. possible values:manniet, testnet  |
| REACT_APP_RELAYER_CONTRACT_ADDRESS  | Content Cell  |
| REACT_APP_COVALENT_API_KEY  | covalent api key for fetching balance and tokens owned by an ethereum address |

In the project directory, you can run:

### Run `npm install`

Before npm start, neccessary to install packages

### Run `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Register Tokens
### From evm to Solana

To register evm tokens on solana chain. following methods of wormhole sdk used

To attest the token, first the Attest VAA is created by calling method **attestFromEth()**

```
const tokenAttestation = await attestFromEth(
		ETH_TOKEN_BRIDGE_ADDRESS,
		signer,
		tokenAddress);
```
The signed VAA is retrieved from Wormhole Rest endpoint, using getSignedVAAWithRetry, this method keeps retrying till signedVAA is retrieved. 
```

const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, sourceChain, emitterAddress, sequence);
```
Here sequence can be retrieved from the tokenAttestation transaction using parseSequenceFromLogEth() and emitter address can be obtained by using getEmitterAddressEth()

Now the signedVaa posted on the solana using postVaaSolanaWithRetry()
```
await postVaaSolanaWithRetry(
				connection,
				signTransaction,
				SOL_BRIDGE_ADDRESS,
				payerAddress,
				Buffer.from(signedVAA),
				10,
				);
```

After the VAA is posted, Wrapped token can be created using createWrappedOnSolana()
```
const createWrappedTxn = await createWrappedOnSolana(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payerAddress,
					signedVAA,
				);
```

#### EVM to Solana Register Demo 


### Solana to evm

Solana to evm is similar to evm to solana, except VAA doesnt need to be posted. Directly wrappedToken can be created. 
 Get signedVAA using **attestFromSolana**
```
const transaction = await attestFromSolana(
			  connection,
			  SOL_BRIDGE_ADDRESS,
			  SOL_TOKEN_BRIDGE_ADDRESS,
			  KEYPAIR.publicKey.toString(),
			  tokenAddress
			);
			
```

Fetch signedVaa 
```
const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, "solana", solana_emitterAddress, solana_sequence);
```

Create Wrapped token in EVM
```
const createWrappedTxn = await createWrappedOnEth(
			ETH_TOKEN_BRIDGE_ADDRESS,
			signer,
			signedVAA
		);
```


## Transfer Tokens 
Transfer contains 2 main steps :
* Transfer
* Redeem

### Transfer

Transfer step consists of transferFromEth() method and fetching the SignedVAA

#### EVM to Solana 

```
const transferrReceipt =  await transferFromEth(
				getTokenBridgeAddressForChain(sourceChainId),
					signer,
					tokenAddress,
					transferAmountParsed,
					recipientChain,
					recipientAddress,
					feeParsed,
					overrides,
			  );
```

#### Solana to EVM
```
const transaction = await transferFromSolana(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer,
					fromAddress,
					mintAddress,
					transferAmountParsed.toBigInt(),
					targetAddress,
					targetChain,
					originAddress,
					originChain,
					undefined,
					feeParsed.toBigInt(),
			  );
```

### Redeem 
#### Redeem on Eth

```
redeemOnEth(getTokenBridgeAddressForChain(chainId), signer, signedVAA, overrides);
```

#### Redeem on Solana

The Vaa Must be posted on solana before being redeemed


```
redeemOnSolana(connection, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS, payerAddress, signedVAA);
```





