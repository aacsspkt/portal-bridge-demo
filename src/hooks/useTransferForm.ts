import {
  useEffect,
  useState,
} from 'react';

import { ethers } from 'ethers';

import { ChainName } from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';

import { KEYPAIR } from '../constants';
import {
  getCorrespondingToken,
  isValidToken,
  transferTokens,
} from '../functions';

interface TokenTransferForm {
	sourceChain: ChainName;
	sourceToken: string;
	targetChain: ChainName;
	targetToken: string;
	transferAmount: string;
}

export const useTransferForm = (list: ChainName[]) => {
	const [data, setData] = useState<TokenTransferForm>({
		sourceChain: list[0],
		sourceToken: "",
		targetChain: list[0],
		targetToken: "",
		transferAmount: "",
	});

	const handleSourceChainChange = async (value: string) => {
		setData({
			...data,
			sourceChain: value as ChainName,
		});
	};

	const handleSourceTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			sourceToken: e.target.value,
		});
	};

	const handleTargetChainChange = async (value: string) => {
		setData({
			...data,
			targetChain: value as ChainName,
		});
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			transferAmount: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const detectedProvider = await detectEthereumProvider();
		const provider = new ethers.providers.Web3Provider(
			// @ts-ignore
			detectedProvider,
			"any",
		);

		const result = await transferTokens(
			data.sourceChain,
			data.targetChain,
			provider,
			data.sourceToken,
			parseFloat(data.transferAmount),
			KEYPAIR.publicKey.toString(),
		);
		console.log("Result", result);
	};

	useEffect(() => {
		const getAndSetTargetToken = async () => {
			try {
				if (data.sourceChain.includes(data.targetChain)) {
					setData({
						...data,
						targetToken: "",
					});
					return;
				}

				console.log("Getting Target Token...");
				const detectedProvider = await detectEthereumProvider();
				const provider = new ethers.providers.Web3Provider(
					// @ts-ignore
					detectedProvider,
					"any",
				);

				if (isValidToken(data.sourceToken, data.sourceChain)) {
					const targetToken = await getCorrespondingToken({
						sourceChain: data.sourceChain,
						targetChain: data.targetChain,
						tokenAddress: data.sourceToken,
						signer: provider.getSigner(),
					});

					console.log("targetToken:", targetToken);

					if (targetToken != null) {
						setData({
							...data,
							targetToken: targetToken,
						});
					} else {
						setData({
							...data,
							targetToken: "",
						});
					}
				}
			} catch (error) {
				console.log(error);
			}
		};

		if (data.sourceToken !== "") {
			getAndSetTargetToken();
		}
	}, [data.sourceChain, data.sourceToken, data.targetChain]);

	return {
		data,
		handleSourceChainChange,
		handleSourceTokenChange,
		handleTargetChainChange,
		handleAmountChange,
		handleSubmit,
	};
};
