import React from 'react';
import './index.css';
import ReactDOM from 'react-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { EthereumProviderProvider } from './hooks/EthereumContextProvider';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { SnackbarProvider } from 'notistack';



//import { MetaMaskProvider } from 'metamask-react';

ReactDOM.render(
  <Provider store={store}>
        <SnackbarProvider maxSnack={3}>
  <React.StrictMode>
    <EthereumProviderProvider>
      <App/>
    </EthereumProviderProvider>
      </React.StrictMode>
      </SnackbarProvider>
  </Provider>
  , document.getElementById('root') as HTMLElement);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
