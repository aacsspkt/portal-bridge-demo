import { useMemo } from "react";

import { hexToUint8Array } from "@certusone/wormhole-sdk";

import { useAppSelector } from "../app/hooks";

export default function useAttestSignedVAA() {
	const signedVAAHex = useAppSelector((state) => state.attest.signedVAAHex);
	const signedVAA = useMemo(() => (signedVAAHex ? hexToUint8Array(signedVAAHex) : undefined), [signedVAAHex]);
	return signedVAA;
}
