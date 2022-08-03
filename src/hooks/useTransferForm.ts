import {
	useCallback,
  useEffect,
  useState,
} from 'react';

import { ethers } from 'ethers';

import { ChainId, ChainName, toChainId, toChainName } from '@certusone/wormhole-sdk';
import detectEthereumProvider from '@metamask/detect-provider';

import { KEYPAIR } from '../constants';
import {
  getCorrespondingToken,
  isValidToken,
  transferTokens,
} from '../functions';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setAmount, setSourceChain, setTargetChain } from '../app/slices/transferSlice';

interface TokenTransferForm {
	sourceChain: ChainName;
	sourceToken: string;
	targetChain: ChainName;
	targetToken: string;
	transferAmount: string;
}

export const useTransferForm = (list: ChainName[]) => {
	const sourceChain = useAppSelector((state) => state.transfer.sourceChain)
	const targetChain = useAppSelector((state) => state.transfer.targetChain)
	const targetAsset = useAppSelector((state) => state.transfer.targetAsset)
	const sourceToken = useAppSelector((state) => state.transfer.sourceParsedTokenAccount);
	const amount = useAppSelector((state)=> state.transfer.amount)
	const dispatch = useAppDispatch();
	const [data, setData] = useState<TokenTransferForm>({
		sourceChain: list[0],
		sourceToken: "",
		targetChain: list[0],
		targetToken: "",
		transferAmount: "",
	});

	
	
	const handleSourceChainChange = useCallback(
		(event: any) => {
			console.log(event)
      dispatch(setSourceChain(toChainId(event)));
    },
    [dispatch]
  );
	const handleSourceTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			sourceToken: e.target.value,
		});
		
		
	};

	const handleTargetChainChange = useCallback(
		(event: any) => {
			console.log(event)
      dispatch(setTargetChain(toChainId(event)));
    },
    [dispatch]
  );

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			transferAmount: e.target.value,
		});
		dispatch(setAmount(data.transferAmount));
		console.log("amount",amount)
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
			toChainName(sourceChain),
			toChainName(targetChain),
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
				if (toChainName(sourceChain).includes(toChainName(targetChain))) {
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

				if (isValidToken(data.sourceToken, toChainName(sourceChain))) {
					const targetToken = await getCorrespondingToken({
						dispatch: dispatch,
						sourceChain: toChainName(sourceChain),
						targetChain: toChainName(targetChain),
						tokenAddress: data.sourceToken,
						signer: provider.getSigner(),
					});
					

					console.log("targetToken:", targetAsset.address);

				}
			} catch (error) {
				console.log(error);
			}
		};

		if (data.sourceToken !== "") {
			getAndSetTargetToken();
		}
	}, [sourceChain, data.sourceToken, targetChain]);

	return {
		data,
		handleSourceChainChange,
		handleSourceTokenChange,
		handleTargetChainChange,
		handleAmountChange,
		handleSubmit,
	};
};
