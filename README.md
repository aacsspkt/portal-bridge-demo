# Portal Bridge Demo

The application makes use of to register tokens of one chain to another. Here registering tokens from EVM to solana and vice versa are implemented. The application can also transfer tokens from one chain to another. It makes use of wormhole sdk to implement these functionalites

wormhole-sdk: https://github.com/certusone/wormhole/tree/dev.v2

The application referred the bridge_ui repo of wormhole. 
bridge_ui: https://github.com/certusone/wormhole/tree/dev.v2/bridge_ui

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup application

## Environment Variables
Make an .env file, the .env file will require folowwing varibales

| Environment Variable Names  | Descriptions |
| ------------- | ------------- |
| REACT_APP_WALLET_SECRET_KEY  | Private key of the solana wallet |
| REACT_APP_CLUSTER  | cluster of the solana network. possible values:manniet, testnet  |
| REACT_APP_RELAYER_CONTRACT_ADDRESS  | Content Cell  |
| REACT_APP_COVALENT_API_KEY  | covalent api key for fetching balance and tokens owned by an ethereum address |

In the project directory, you can run:

## Run `npm install`

Before npm start, neccessary to install packages

## Run `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.


