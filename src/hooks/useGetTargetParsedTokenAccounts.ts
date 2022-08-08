import {
  useEffect,
  useMemo,
} from 'react';

import { formatUnits } from 'ethers/lib/utils';

import {
  isEVMChain,
  TokenImplementation__factory,
} from '@certusone/wormhole-sdk';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import { setTargetParsedTokenAccount } from '../app/slices/transferSlice';
import {
  getEvmChainId,
  isSolanaChain,
  KEYPAIR,
  SOLANA_HOST,
} from '../constants';
import { useEthereumProvider } from '../contexts/EthereumContextProvider';
import { createParsedTokenAccount } from './useGetSourceParsedTokenAccounts';

function useGetTargetParsedTokenAccounts() {
	const dispatch = useAppDispatch();
	const targetChain = useAppSelector((state) => state.transfer.targetChain);
	const targetAsset = useAppSelector((state) => state.transfer.targetAsset.data?.address);
	const targetAssetArrayed = useMemo(() => (targetAsset ? [targetAsset] : []), [targetAsset]);
	const solPK = KEYPAIR.publicKey;
	const { provider, signerAddress, chainId: evmChainId } = useEthereumProvider();
	const hasCorrectEvmNetwork = evmChainId === getEvmChainId(targetChain);
	useEffect(() => {
		// targetParsedTokenAccount is cleared on setTargetAsset, but we need to clear it on wallet changes too
		dispatch(setTargetParsedTokenAccount(undefined));
		if (!targetAsset) {
			return;
		}
		let cancelled = false;

		if (isSolanaChain(targetChain) && solPK) {
			let mint;
			try {
				mint = new PublicKey(targetAsset);
			} catch (e) {
				return;
			}
			const connection = new Connection(SOLANA_HOST, "confirmed");
			connection
				.getParsedTokenAccountsByOwner(solPK, { mint })
				.then(({ value }) => {
					if (!cancelled) {
						if (value.length) {
							dispatch(
								setTargetParsedTokenAccount(
									createParsedTokenAccount(
										value[0].pubkey.toString(),
										value[0].account.data.parsed?.info?.mint,
										value[0].account.data.parsed?.info?.tokenAmount?.amount,
										value[0].account.data.parsed?.info?.tokenAmount?.decimals,
										value[0].account.data.parsed?.info?.tokenAmount?.uiAmount,
										value[0].account.data.parsed?.info?.tokenAmount?.uiAmountString,
										undefined,
										undefined,
										undefined,
									),
								),
							);
						} else {
							// TODO: error state
						}
					}
				})
				.catch(() => {
					if (!cancelled) {
						// TODO: error state
					}
				});
		}
		if (isEVMChain(targetChain) && provider && signerAddress && hasCorrectEvmNetwork) {
			const token = TokenImplementation__factory.connect(targetAsset, provider);
			token
				.decimals()
				.then((decimals) => {
					token.balanceOf(signerAddress).then((n) => {
						if (!cancelled) {
							dispatch(
								setTargetParsedTokenAccount(
									// TODO: verify auseGetAvailableTokensccuracy
									createParsedTokenAccount(
										signerAddress,
										token.address,
										n.toString(),
										decimals,
										Number(formatUnits(n, decimals)),
										formatUnits(n, decimals),
										undefined,
										undefined,
										undefined,
									),
								),
							);
						}
					});
				})
				.catch(() => {
					if (!cancelled) {
						// TODO: error state
					}
				});
		}

		return () => {
			cancelled = true;
		};
	}, [dispatch, targetAsset, targetChain, provider, signerAddress, solPK, hasCorrectEvmNetwork]);
}

export default useGetTargetParsedTokenAccounts;
