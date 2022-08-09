import { useEffect } from 'react';

import { isEVMChain } from '@certusone/wormhole-sdk';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import { setSourceWalletAddress } from '../app/slices/transferSlice';
import {
  isSolanaChain,
  KEYPAIR,
} from '../constants';
import { useEthereumProvider } from '../contexts/EthereumContextProvider';

export default function useGetSourceWalletAddress() {
	const dispatch = useAppDispatch();
	const { signerAddress, connect, walletConnected } = useEthereumProvider();
	const solPK = KEYPAIR.publicKey.toString();
	const sourceChain = useAppSelector((state) => state.transfer.sourceChain);
	const sourceAddress = useAppSelector((state) => state.transfer.sourceWalletAddress);

	useEffect(() => {
		if (!sourceAddress) {
			if (isSolanaChain(sourceChain)) {
				dispatch(setSourceWalletAddress(solPK));
			}
			if (isEVMChain(sourceChain)) {
				if (!walletConnected) {
					connect();
				}
				dispatch(setSourceWalletAddress(signerAddress));
			}
		}
	}, [sourceChain, walletConnected, signerAddress, sourceAddress]);
}
