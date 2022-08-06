import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import {
  formatEther,
  formatUnits,
} from 'ethers/lib/utils';

import {
  CHAIN_ID_ETH,
  CHAIN_ID_ETHEREUM_ROPSTEN,
  CHAIN_ID_SOLANA,
  ChainId,
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
  BLOCKSCOUT_GET_TOKENS_URL,
  COVALENT_GET_TOKENS_URL,
  getDefaultNativeCurrencyAddressEvm,
  KEYPAIR,
  ROPSTEN_WETH_ADDRESS,
  ROPSTEN_WETH_DECIMALS,
  SOLANA_HOST,
  WETH_ADDRESS,
  WETH_DECIMALS,
} from '../constants';
import {
  Provider,
  useEthereumProvider,
} from '../contexts/EthereumContextProvider';
import {
  ExtractedMintInfo,
  extractMintInfo,
  parseSolPubKey,
} from '../utils/solana';

export type CovalentData = {
	contract_decimals: number;
	contract_ticker_symbol: string;
	contract_name: string;
	contract_address: string;
	logo_url: string | undefined;
	balance: string;
	quote: number | undefined;
	quote_rate: number | undefined;
};

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

const getEthereumAccountsCovalent = async (url: string, chainId: ChainId): Promise<CovalentData[]> => {
	try {
		const output = [] as CovalentData[];
		const response = await axios.get(url);
		const tokens = response.data.data.items;

		if (tokens instanceof Array && tokens.length) {
			for (const item of tokens) {
				// TODO: filter?
				if (
					item.contract_decimals !== undefined &&
					item.contract_address &&
					item.contract_address.toLowerCase() !== getDefaultNativeCurrencyAddressEvm(chainId).toLowerCase() && // native balance comes from querying token bridge
					item.balance &&
					item.balance !== "0" &&
					item.supports_erc?.includes("erc20")
				) {
					output.push({ ...item } as CovalentData);
				}
			}
		}

		return output;
	} catch (error) {
		return Promise.reject("Unable to retrieve your Ethereum Tokens.");
	}
};

const createParsedTokenAccountFromCovalent = (walletAddress: string, covalent: CovalentData): ParsedTokenAccount => {
	console.log(
		"createParse",
		walletAddress,
		covalent.contract_address,
		covalent.balance,
		covalent.contract_decimals,
		Number(formatUnits(covalent.balance, covalent.contract_decimals)),
		formatUnits(covalent.balance, covalent.contract_decimals),
		covalent.contract_ticker_symbol,
		covalent.contract_name,
	);
	return {
		publicKey: walletAddress,
		mintKey: covalent.contract_address,
		amount: covalent.balance,
		decimals: covalent.contract_decimals,
		uiAmount: Number(formatUnits(covalent.balance, covalent.contract_decimals)),
		uiAmountString: formatUnits(covalent.balance, covalent.contract_decimals),
		symbol: covalent.contract_ticker_symbol,
		name: covalent.contract_name,
	};
};

export const getEthereumAccountsBlockscout = async (url: string, chainId: ChainId): Promise<CovalentData[]> => {
	try {
		const output = [] as CovalentData[];
		const response = await axios.get(url);
		const tokens = response.data.result;

		if (tokens instanceof Array && tokens.length) {
			for (const item of tokens) {
				if (
					item.decimals !== undefined &&
					item.contractAddress &&
					item.contractAddress.toLowerCase() !== getDefaultNativeCurrencyAddressEvm(chainId).toLowerCase() && // native balance comes from querying token bridge
					item.balance &&
					item.balance !== "0" &&
					item.type?.includes("ERC-20")
				) {
					output.push({
						contract_decimals: item.decimals,
						contract_address: item.contractAddress,
						balance: item.balance,
						contract_ticker_symbol: item.symbol,
						contract_name: item.name,
						logo_url: "",
						quote: 0,
						quote_rate: 0,
					});
				}
			}
		}

		return output;
	} catch (error) {
		return Promise.reject("Unable to retrieve your Ethereum Tokens.");
	}
};

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

function useGetAvailableTokens() {
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
	const [covalent, setCovalent] = useState<any>(undefined);
	const [covalentLoading, setCovalentLoading] = useState(false);
	const [covalentError, setCovalentError] = useState<string | undefined>(undefined);
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

		let ignore = false;
		setSolanaMintAccountsLoading(true);
		setSolanaMintAccountsError(undefined);
		const mintAddresses = tokenAccounts.data.map((x) => x.mintKey);
		const connection = new Connection(SOLANA_HOST, "confirmed");
		connection.getMultipleAccountsInfo(mintAddresses.map((x) => parseSolPubKey(x))).then(
			(results) => {
				if (!ignore) {
					const output = new Map<string, ExtractedMintInfo | null>();

					results.forEach((result, index) =>
						output.set(mintAddresses[index], (result && extractMintInfo(result)) || null),
					);
					setSolanaMintAccounts(output);
					setSolanaMintAccountsLoading(false);
				}
			},
			(error) => {
				if (!ignore) {
					setSolanaMintAccounts(undefined);
					setSolanaMintAccountsLoading(false);
					setSolanaMintAccountsError("Could not retrieve Solana mint accounts.");
				}
			},
		);

		return () => (ignore = true);
	}, [tokenAccounts.data, lookupChain]);

	//Ethereum native asset load
	useEffect(() => {
		let ignore = false;
		if (signerAddress && lookupChain === CHAIN_ID_ETH && !ethNativeAccount) {
			setEthNativeAccountLoading(true);
			createNativeEthParsedTokenAccount(provider, signerAddress).then(
				(result) => {
					console.log("create native account returned with value", result);
					if (!ignore) {
						setEthNativeAccount(result);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("");
					}
				},
				(error) => {
					if (!ignore) {
						setEthNativeAccount(undefined);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("Unable to retrieve your ETH balance.");
					}
				},
			);
		}

		return () => {
			ignore = true;
		};
	}, [lookupChain, provider, signerAddress, ethNativeAccount]);

	//Ethereum (Ropsten) native asset load
	useEffect(() => {
		let ignore = false;
		if (signerAddress && lookupChain === CHAIN_ID_ETHEREUM_ROPSTEN && !ethNativeAccount) {
			setEthNativeAccountLoading(true);
			createNativeEthRopstenParsedTokenAccount(provider, signerAddress).then(
				(result) => {
					console.log("create native account returned with value", result);
					if (!ignore) {
						setEthNativeAccount(result);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("");
					}
				},
				(error) => {
					if (!ignore) {
						setEthNativeAccount(undefined);
						setEthNativeAccountLoading(false);
						setEthNativeAccountError("Unable to retrieve your ETH balance.");
					}
				},
			);
		}

		return () => {
			ignore = true;
		};
	}, [lookupChain, provider, signerAddress, ethNativeAccount]);

	//Ethereum token accounts load
	useEffect(() => {
		//const testWallet = "0xf60c2ea62edbfe808163751dd0d8693dcb30019c";
		// const nftTestWallet1 = "0x3f304c6721f35ff9af00fd32650c8e0a982180ab";
		// const nftTestWallet2 = "0x98ed231428088eb440e8edb5cc8d66dcf913b86e";
		// const nftTestWallet3 = "0xb1fadf677a7e9b90e9d4f31c8ffb3dc18c138c6f";
		// const nftBscTestWallet1 = "0x5f464a652bd1991df0be37979b93b3306d64a909";

		let ignore = false;
		const walletAddress = signerAddress;
		if (walletAddress && isEVMChain(lookupChain) && !covalent) {
			let url = COVALENT_GET_TOKENS_URL(lookupChain, walletAddress);
			console.log(url);
			let getAccounts;
			if (url) {
				getAccounts = getEthereumAccountsCovalent;
			} else {
				url = BLOCKSCOUT_GET_TOKENS_URL(lookupChain, walletAddress);
				getAccounts = getEthereumAccountsBlockscout;
			}
			if (!url) {
				return;
			}

			console.log("here");
			//TODO less cancel
			!ignore && setCovalentLoading(true);
			!ignore && dispatch(fetchSourceParsedTokenAccounts());
			getAccounts(url, lookupChain).then(
				(accounts) => {
					dispatch(
						receiveSourceParsedTokenAccounts(
							accounts.map((x) => createParsedTokenAccountFromCovalent(walletAddress, x)),
						),
					);
				},
				() => {
					!ignore && dispatch(errorSourceParsedTokenAccounts("Cannot load your Ethereum tokens at the moment."));
					!ignore && setCovalentError("Cannot load your Ethereum tokens at the moment.");
					!ignore && setCovalentLoading(false);
				},
			);

			return () => {
				ignore = true;
			};
		}
	}, [lookupChain, provider, signerAddress, dispatch, covalent]);

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
				covalent: {
					data: covalent,
					isFetching: covalentLoading,
					error: covalentError,
					receivedAt: null, //TODO
				},
				resetAccounts: resetSourceAccounts,
		  }
		: undefined;
}

export default useGetAvailableTokens;
