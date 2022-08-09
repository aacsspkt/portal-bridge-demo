import * as b from 'byteify';
import keccak256 from 'keccak256';

import {
  CHAIN_ID_BSC,
  CHAIN_ID_SOLANA,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAAWithRetry,
  importCoreWasm,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolanaWithRetry,
  setDefaultWasm,
} from '@certusone/wormhole-sdk';
import * as anchor from '@project-serum/anchor';
import {
  AnchorProvider,
  Idl,
  Program,
} from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import {
  findProgramAddressSync,
} from '@project-serum/anchor/dist/cjs/utils/pubkey';
import {
  Connection,
  PublicKey,
  TransactionResponse,
} from '@solana/web3.js';

import {
  BSC_BRIDGE_ADDRESS,
  KEYPAIR,
  SOL_BRIDGE_ADDRESS,
  SOLANA_HOST,
  WORMHOLE_RPC_HOSTS,
} from '../constants';
import idl from '../idl/solana_project.json';

const SOL_CONTRACT_ADDRESS = "72LwKH2vh1DT5JvSeQseVp2P1oQbpA2FWr8v45ZMHAVT";
const BSC_CONTRACT_ADDRESS = "0x4083f716f1fbBf19680A7C37E2fa07eE1A8c9907";
const CALLING_SC_ADDRESS = new anchor.web3.PublicKey("Bxi8KcfKcCDA6n8gmyZaHSfpXBBSjuTZTxsgfmdSBU1g");
// const KEYPAIR = anchor.web3.Keypair.generate()
const connection = new Connection(SOLANA_HOST);

const getProvider = () => {
	const provider = new AnchorProvider(connection, new NodeWallet(KEYPAIR), {
		preflightCommitment: "confirmed",
	});
	return provider;
};

const getProgram = () => {
	const program = new Program(idl as Idl, SOL_CONTRACT_ADDRESS, getProvider());
	return program;
};

export async function init() {
	const program = getProgram();

	const [config_acc, _token_bump] = await PublicKey.findProgramAddress([Buffer.from("config")], program.programId);

	console.log("invoking contract ko initialie function");
	await program.methods
		.initialize()
		.accounts({
			config: config_acc,
			owner: KEYPAIR.publicKey,
			systemProgram: anchor.web3.SystemProgram.programId,
		})
		.rpc();
}

export async function registerEthAddress() {
	console.log(KEYPAIR.publicKey.toBase58());
	const program = getProgram();
	const emmiter_acc = findProgramAddressSync(
		[Buffer.from("EmitterAddress"), b.serializeUint16(CHAIN_ID_BSC)],
		program.programId,
	)[0];

	console.log("emmitter acc when registering ===> ", emmiter_acc.toBase58());
	console.log("Emitter address===>", getEmitterAddressEth(BSC_CONTRACT_ADDRESS));
	await program.methods
		.registerChain(CHAIN_ID_BSC, getEmitterAddressEth(BSC_CONTRACT_ADDRESS))
		.accounts({
			owner: KEYPAIR.publicKey,
			systemProgram: anchor.web3.SystemProgram.programId,
			config: findProgramAddressSync([Buffer.from("config")], program.programId)[0],
			emitterAcc: emmiter_acc,
		})
		.rpc();
}

export async function send_message() {
	setDefaultWasm("bundler");

	const program = getProgram();

	//Send a Message
	const msg_text = "";
	const whCoreBridge = new anchor.web3.PublicKey("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5");
	const whConfig = findProgramAddressSync([Buffer.from("Bridge")], whCoreBridge)[0];
	const whFeeCollector = findProgramAddressSync([Buffer.from("fee_collector")], whCoreBridge)[0];
	const whDerivedEmitter = findProgramAddressSync([Buffer.from("emitter")], program.programId)[0];
	const whSequence = findProgramAddressSync([Buffer.from("Sequence"), whDerivedEmitter.toBytes()], whCoreBridge)[0];
	const whMessageKeypair = anchor.web3.Keypair.generate();
	const tx = await program.methods
		.sendMsg(msg_text)
		.accounts({
			coreBridge: whCoreBridge,
			wormholeConfig: whConfig,
			wormholeFeeCollector: whFeeCollector,
			wormholeDerivedEmitter: whDerivedEmitter,
			wormholeSequence: whSequence,
			wormholeMessageKey: whMessageKeypair.publicKey,
			payer: KEYPAIR.publicKey,
			systemProgram: anchor.web3.SystemProgram.programId,
			clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
			rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			config: findProgramAddressSync([Buffer.from("config")], program.programId)[0],
		})
		.signers([KEYPAIR, whMessageKeypair])
		.rpc();
	await new Promise((r) => setTimeout(r, 15000));

	const seq = parseSequenceFromLogSolana((await program.provider.connection.getTransaction(tx)) as TransactionResponse);
	console.log("Sequence: ", seq);
	const emitterAddress = await getEmitterAddressSolana(program.programId.toString());
	console.log("Emitter Addresss: ", emitterAddress);

	const vaaBytes = await (
		await fetch(`${WORMHOLE_RPC_HOSTS}/v1/signed_vaa/${CHAIN_ID_SOLANA}/${emitterAddress}/${seq}`)
	).json();
	console.log("Signed VAA: ", vaaBytes);
}

export async function postAndSendPayload(tx: any) {
	setDefaultWasm("bundler");
	const { parse_vaa } = await importCoreWasm();

	const program = getProgram();

	const sequence = parseSequenceFromLogEth(tx, BSC_BRIDGE_ADDRESS);
	console.log("seq", sequence);

	const emitterAddress = getEmitterAddressEth(BSC_CONTRACT_ADDRESS);
	console.log("emitter Address", emitterAddress);

	console.log("fetching Vaa");
	const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, "bsc", emitterAddress, sequence);
	console.log("Raw VAA ===> ", vaaBytes);

	console.log("Posting VAA");
	//Submit to Core Bridge
	await postVaaSolanaWithRetry(
		connection,
		async (tx) => {
			tx.partialSign(KEYPAIR);
			return tx;
		},
		SOL_BRIDGE_ADDRESS,
		KEYPAIR.publicKey.toString(),
		Buffer.from(vaaBytes),
		10,
	);

	await new Promise((r) => setTimeout(r, 15000));

	const parsed_vaa = parse_vaa(vaaBytes);
	console.log("Parsed VAA ==>", parsed_vaa);

	console.log("Finding Emitter Address");
	let emitter_address_acc = findProgramAddressSync(
		[Buffer.from("EmitterAddress"), b.serializeUint16(parsed_vaa.emitter_chain)],
		program.programId,
	)[0];
	console.log("Derived emmiter in confirm_msg ==> ", emitter_address_acc.toBase58());

	console.log("Find processed vaa");
	let processed_vaa_key = findProgramAddressSync(
		[
			Buffer.from(getEmitterAddressEth(BSC_CONTRACT_ADDRESS).toString(), "hex"),
			b.serializeUint16(parsed_vaa.emitter_chain),
			b.serializeUint64(parsed_vaa.sequence),
		],
		program.programId,
	)[0];

	//Create VAA Hash to use in core bridge key
	let buffer_array = [];
	buffer_array.push(b.serializeUint32(parsed_vaa.timestamp));
	buffer_array.push(b.serializeUint32(parsed_vaa.nonce));
	buffer_array.push(b.serializeUint16(parsed_vaa.emitter_chain));
	buffer_array.push(Uint8Array.from(parsed_vaa.emitter_address));
	buffer_array.push(b.serializeUint64(parsed_vaa.sequence));
	buffer_array.push(b.serializeUint8(parsed_vaa.consistency_level));
	buffer_array.push(Uint8Array.from(parsed_vaa.payload));
	const hash = keccak256(Buffer.concat(buffer_array));

	console.log("Find Core Bridge Address");
	let core_bridge_vaa_key = findProgramAddressSync(
		[Buffer.from("PostedVAA"), hash],
		new anchor.web3.PublicKey(SOL_BRIDGE_ADDRESS),
	)[0];
	console.log("Core Bridge VAA Key: ", core_bridge_vaa_key.toString());

	let config_acc = findProgramAddressSync([Buffer.from("config")], program.programId)[0];

	//Confirm
	await program.methods
		.confirmMsg()
		.accounts({
			payer: KEYPAIR.publicKey,
			systemProgram: anchor.web3.SystemProgram.programId,
			processedVaa: processed_vaa_key,
			emitterAcc: emitter_address_acc,
			coreBridgeVaa: core_bridge_vaa_key,
			config: config_acc,
			cpiProgram: CALLING_SC_ADDRESS,
		})
		.rpc();

	console.log((await program.account.config.fetch(config_acc)).currentMsg);
}
