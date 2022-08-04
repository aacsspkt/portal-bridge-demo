import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  formatEther,
  formatUnits,
} from 'ethers/lib/utils';

import {
  CHAIN_ID_ETH,
  CHAIN_ID_ETHEREUM_ROPSTEN,
  CHAIN_ID_SOLANA,
  isEVMChain,
  WSOL_ADDRESS,
  WSOL_DECIMALS,
} from '@certusone/wormhole-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  AccountInfo,
  Connection,
  ParsedAccountData,
  PublicKey,
} from '@solana/web3.js';

import {
  useAppDispatch,
  useAppSelector,
} from '../app/hooks';
import {
  errorSourceParsedTokenAccounts,
  fetchSourceParsedTokenAccounts,
  ParsedTokenAccount,
  receiveSourceParsedTokenAccounts,
  setAmount,
  setSourceParsedTokenAccount,
  setSourceParsedTokenAccounts,
  setSourceWalletAddress,
} from '../app/slices/transferSlice';
import { AppDispatch } from '../app/store';
import {
  KEYPAIR,
  ROPSTEN_WETH_ADDRESS,
  ROPSTEN_WETH_DECIMALS,
  SOLANA_HOST,
  WETH_ADDRESS,
  WETH_DECIMALS,
} from '../constants';
import {
  ExtractedMintInfo,
  extractMintInfo,
  parseSolPubKey,
} from '../utils/solana';
import {
  Provider,
  useEthereumProvider,
} from './EthereumContextProvider';

export function createParsedTokenAccount(
	publicKey: string,
	mintKey: string,
	amount: string,
	decimals: number,
	uiAmount: number,
	uiAmountString: string,
	symbol?: string,
	name?: string,
	logo?: string,
	isNativeAsset?: boolean,
): ParsedTokenAccount {
	return {
		publicKey: publicKey,
		mintKey: mintKey,
		amount,
		decimals,
		uiAmount,
		uiAmountString,
		symbol,
		name,
		logo,
		isNativeAsset,
	};
}

/** for solana */

const createParsedTokenAccountFromInfo = (
	pubkey: PublicKey,
	item: AccountInfo<ParsedAccountData>,
): ParsedTokenAccount => {
	return {
		publicKey: pubkey?.toString(),
		mintKey: item.data.parsed?.info?.mint?.toString(),
		amount: item.data.parsed?.info?.tokenAmount?.amount,
		decimals: item.data.parsed?.info?.tokenAmount?.decimals,
		uiAmount: item.data.parsed?.info?.tokenAmount?.uiAmount,
		uiAmountString: item.data.parsed?.info?.tokenAmount?.uiAmountString,
	};
};

const createNativeSolParsedTokenAccount = async (connection: Connection, walletAddress: string) => {
	try {
		const balance = await connection.getBalance(parseSolPubKey(walletAddress));
		return createParsedTokenAccount(
			walletAddress, //publicKey
			WSOL_ADDRESS, //Mint key
			balance.toString(), //amount
			WSOL_DECIMALS, //decimals, 9
			parseFloat(formatUnits(balance, WSOL_DECIMALS)),
			formatUnits(balance, WSOL_DECIMALS).toString(),
			"SOL",
			"Solana",
			undefined,
			true,
		);
	} catch (error) {
		return null;
	}
};

const getSolanaParsedTokenAccounts = async (walletAddress: string, dispatch: AppDispatch) => {
	const connection = new Connection(SOLANA_HOST, "confirmed");
	dispatch(fetchSourceParsedTokenAccounts());
	try {
		let splParsedTokenAccounts = await connection
			.getParsedTokenAccountsByOwner(parseSolPubKey(walletAddress), {
				programId: TOKEN_PROGRAM_ID,
			})
			.then((result) => {
				return result.value.map((item) => createParsedTokenAccountFromInfo(item.pubkey, item.account));
			});

		// Pull the SOL balance of the wallet, and prepend it at the beginning of the list.
		const nativeAccount = await createNativeSolParsedTokenAccount(connection, walletAddress);
		if (nativeAccount !== null) {
			splParsedTokenAccounts.unshift(nativeAccount);
		}
		dispatch(receiveSourceParsedTokenAccounts(splParsedTokenAccounts));
	} catch (e) {
		console.error(e);
		dispatch(errorSourceParsedTokenAccounts("Failed to load token metadata."));
	}
};

/** end for solana */

/** for ethereum */

const createNativeEthParsedTokenAccount = async (provider: Provider, signerAddress: string | undefined) => {
	try {
		if (provider && signerAddress) {
			let balanceInWei = await provider.getBalance(signerAddress);
			const balanceInEth = formatEther(balanceInWei);
			return createParsedTokenAccount(
				signerAddress,
				WETH_ADDRESS,
				balanceInWei.toString(),
				WETH_DECIMALS,
				parseFloat(balanceInEth),
				balanceInEth.toString(),
				"ETH",
				"Ethereum",
				undefined,
				true,
			);
		}
		return null;
	} catch (error) {
		return null;
	}
};

const createNativeEthRopstenParsedTokenAccount = async (provider: Provider, signerAddress: string | undefined) => {
	try {
		if (provider && signerAddress) {
			let balanceInWei = await provider.getBalance(signerAddress);
			const balanceInEth = formatEther(balanceInWei);
			return createParsedTokenAccount(
				signerAddress,
				ROPSTEN_WETH_ADDRESS,
				balanceInWei.toString(),
				ROPSTEN_WETH_DECIMALS,
				parseFloat(balanceInEth),
				balanceInEth.toString(),
				"ETH",
				"Ethereum",
				undefined,
				true,
			);
		}
		return null;
	} catch (error) {
		return null;
	}
};

/** end for ethereum */

function useGetAvailableTokens(nft: boolean = false) {
	const dispatch = useAppDispatch();
	const tokenAccounts = useAppSelector((state) => state.transfer.sourceParsedTokenAccounts);
	const lookupChain = useAppSelector((state) => state.transfer.sourceChain);
	const solPK = KEYPAIR.publicKey;
	const { provider, signerAddress } = useEthereumProvider();
	const [ethNativeAccount, setEthNativeAccount] = useState<any>(undefined);
	const [ethNativeAccountLoading, setEthNativeAccountLoading] = useState(false);
	const [ethNativeAccountError, setEthNativeAccountError] = useState<string | undefined>(undefined);
	const [solanaMintAccounts, setSolanaMintAccounts] = useState<Map<string, ExtractedMintInfo | null> | undefined>(
		undefined,
	);
	const [solanaMintAccountsLoading, setSolanaMintAccountsLoading] = useState(false);
	const [solanaMintAccountsError, setSolanaMintAccountsError] = useState<string | undefined>(undefined);

	const selectedSourceWalletAddress = useAppSelector((state) => state.transfer.sourceWalletAddress);
	const currentSourceWalletAddress: string | undefined = isEVMChain(lookupChain)
		? signerAddress
		: lookupChain === CHAIN_ID_SOLANA
		? solPK?.toString()
		: undefined;

	const resetSourceAccounts = useCallback(() => {
		dispatch(setSourceWalletAddress(undefined));
		dispatch(setSourceParsedTokenAccount(undefined));
		dispatch(setSourceParsedTokenAccounts(undefined));
		dispatch(setAmount(""));
		setEthNativeAccount(undefined);
		setEthNativeAccountLoading(false);
		setEthNativeAccountError("");
	}, [dispatch]);

	//TODO this useEffect could be somewhere else in the codebase
	//It resets the SourceParsedTokens accounts when the wallet changes
	useEffect(() => {
		if (
			selectedSourceWalletAddress !== undefined &&
			currentSourceWalletAddress !== undefined &&
			currentSourceWalletAddress !== selectedSourceWalletAddress
		) {
			resetSourceAccounts();
			return;
		} else {
		}
	}, [selectedSourceWalletAddress, currentSourceWalletAddress, dispatch, resetSourceAccounts]);

	//Solana accountinfos load
	useEffect(() => {
		if (lookupChain === CHAIN_ID_SOLANA && solPK) {
			if (!(tokenAccounts.data || tokenAccounts.isFetching || tokenAccounts.error)) {
				getSolanaParsedTokenAccounts(solPK.toString(), dispatch);
			}
		}

		return () => {};
	}, [dispatch, lookupChain, solPK, tokenAccounts]);

	//Solana Mint Accounts lookup
	useEffect(() => {
		if (lookupChain !== CHAIN_ID_SOLANA || !tokenAccounts.data?.length) {
			return () => {};
		}

		let cancelled = false;
		setSolanaMintAccountsLoading(true);
		setSolanaMintAccountsError(undefined);
		const mintAddresses = tokenAccounts.data.map((x) => x.mintKey);
		const connection = new Connection(SOLANA_HOST, "confirmed");
		connection.getMultipleAccountsInfo(mintAddresses.map((x) => parseSolPubKey(x))).then(
			(results) => {
				if (!cancelled) {
					const output = new Map<string, ExtractedMintInfo | null>();

					results.forEach((result, index) =>
						output.set(mintAddresses[index], (result && extractMintInfo(result)) || null),
					);
					setSolanaMintAccounts(output);
					setSolanaMintAccountsLoading(false);
				}
			},
			(error) => {
				if (!cancelled) {
					setSolanaMintAccounts(undefined);
					setSolanaMintAccountsLoading(false);
					setSolanaMintAccountsError("Could not retrieve Solana mint accounts.");
				}
			},
		);

		return () => (cancelled = true);
	}, [tokenAccounts.data, lookupChain]);

	//Ethereum native asset load
	useEffect(() => {
		let cancelled = false;
		if (signerAddress && lookupChain === CHAIN_ID_ETH && !ethNativeAccount) {
			setEthNativeAccountLoading(true);
			createNativeEthParsedTokenAccount(provider, signerAddress).then(
				(result) => {
					console.log("create native account returned with value", result);
					if (!cancelled) {
						setEthNativeAccount(result);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("");
					}
				},
				(error) => {
					if (!cancelled) {
						setEthNativeAccount(undefined);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("Unable to retrieve your ETH balance.");
					}
				},
			);
		}

		return () => {
			cancelled = true;
		};
	}, [lookupChain, provider, signerAddress, ethNativeAccount]);

	//Ethereum (Ropsten) native asset load
	useEffect(() => {
		let cancelled = false;
		if (signerAddress && lookupChain === CHAIN_ID_ETHEREUM_ROPSTEN && !ethNativeAccount) {
			setEthNativeAccountLoading(true);
			createNativeEthRopstenParsedTokenAccount(provider, signerAddress).then(
				(result) => {
					console.log("create native account returned with value", result);
					if (!cancelled) {
						setEthNativeAccount(result);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("");
					}
				},
				(error) => {
					if (!cancelled) {
						setEthNativeAccount(undefined);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("Unable to retrieve your ETH balance.");
					}
				},
			);
		}

		return () => {
			cancelled = true;
		};
	}, [lookupChain, provider, signerAddress, ethNativeAccount]);

	//Ethereum token accounts load
	useEffect(() => {
		let cancelled = false;
		const walletAddress = signerAddress;
		if (walletAddress && isEVMChain(lookupChain)) {
			// Todo

			return () => {
				cancelled = true;
			};
		}
	}, [lookupChain, provider, signerAddress, dispatch]);

	const ethAccounts = useMemo(() => {
		const output = { ...tokenAccounts };
		output.data = output.data?.slice() || [];
		output.isFetching = output.isFetching || ethNativeAccountLoading;
		output.error = output.error || ethNativeAccountError;
		ethNativeAccount && output.data && output.data.unshift(ethNativeAccount);
		return output;
	}, [ethNativeAccount, ethNativeAccountLoading, ethNativeAccountError, tokenAccounts]);

	return lookupChain === CHAIN_ID_SOLANA
		? {
				tokenAccounts,
				mintAccounts: {
					data: solanaMintAccounts,
					isFetching: solanaMintAccountsLoading,
					error: solanaMintAccountsError,
					receivedAt: null, //TODO
				},
				resetAccounts: resetSourceAccounts,
		  }
		: isEVMChain(lookupChain)
		? {
				tokenAccounts: ethAccounts,
				// covalent: {
				// 	data: covalent,
				// 	isFetching: covalentLoading,
				// 	error: covalentError,
				// 	receivedAt: null, //TODO
				// },
				resetAccounts: resetSourceAccounts,
		  }
		: undefined;
}

export default useGetAvailableTokens;
