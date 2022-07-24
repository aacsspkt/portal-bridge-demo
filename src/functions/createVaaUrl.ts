export function createVaaURL(
	wormholeRestAddress: string,
	wormholeChainId: string,
	emmiterAddress: string,
	sequence: string,
) {
	return `${wormholeRestAddress}/v1/signed_vaa/${wormholeChainId}/${emmiterAddress}/${sequence}`;
}
