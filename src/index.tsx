import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import App from './App';
import { store } from './app/store';
import { context2CssClass } from './constants';
import { EthereumProviderProvider } from './contexts/EthereumContextProvider';
import reportWebVitals from './reportWebVitals';
import 'react-toastify/dist/ReactToastify.css';
//import { MetaMaskProvider } from 'metamask-react';

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <EthereumProviderProvider>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          icon={true}
        />
      </EthereumProviderProvider>
    </React.StrictMode>
  </Provider>
  , document.getElementById('root') as HTMLElement);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
