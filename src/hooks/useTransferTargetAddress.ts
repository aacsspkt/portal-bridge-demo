import { useMemo } from 'react';

import { hexToUint8Array } from '@certusone/wormhole-sdk';

import { useAppSelector } from '../app/hooks';

export default function useTransferTargetAddress() {
	const targetAddressHex = useAppSelector((state) => state.transfer.targetAddressHex);

	const targetAddress = useMemo(() => {
		return targetAddressHex ? hexToUint8Array(targetAddressHex) : undefined;
	}, [targetAddressHex]);

	return targetAddress;
}
