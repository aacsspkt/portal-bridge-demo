import { WSOL_ADDRESS } from "@certusone/wormhole-sdk";

import { ROPSTEN_WETH_ADDRESS, WETH_ADDRESS } from "../constants";

export const isNativeEth = (address: string) => {
	return address.toLowerCase() === WETH_ADDRESS.toLowerCase();
};

export const isNativeRopstenEth = (address: string) => {
	return address.toLowerCase() === ROPSTEN_WETH_ADDRESS.toLowerCase();
};

export const isNativeSol = (address: string) => {
	return address === WSOL_ADDRESS;
};

export const isNativeEligible = (address: string) => {
	return isNativeEth(address) || isNativeRopstenEth(address) || isNativeSol(address);
};
