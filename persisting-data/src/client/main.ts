import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';
import os from 'os';
import yaml from 'yaml';

import { createKeypairFromFile } from './utils';

/**
 * Path to Solana CLI config file
 */
const CONFIG_FILE_PATH = path.resolve(
  os.homedir(),
  '.config',
  'solana',
  'cli',
  'config.yml',
)

let connection: Connection;
let clientPubkey: PublicKey;
let programId: PublicKey;
let programKeypair: Keypair;
let localKeypair: Keypair;

const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

/**
 * Connect to dev net
 */
export async function connect() {
  connection = new Connection('https://api.example.devnet.solana.com', 'confirmed');
  console.log('Successfully connected to Solana devnet');
}

/**
 * Use local keypair for client
 */
export async function getLocalAccount() {
  const configYml = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
  const keypairPath =  await yaml.parse(configYml).keypair_path;
  localKeypair = await createKeypairFromFile(keypairPath);
  const airdropRequestSignature = await connection.requestAirdrop(
    localKeypair.publicKey,
    LAMPORTS_PER_SOL*2,
  );
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: airdropRequestSignature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  });
  console.log(`Local account loaded successfully.`);
  console.log(`Local account's address is:`);
  console.log(`   ${localKeypair.publicKey}`);
}

/*
 * Get the targeted program
 */
export async function getProgram(programName: string) {
  programKeypair = await createKeypairFromFile(
    path.join(PROGRAM_PATH, programName + '-keypair.json'),
  );
  programId = programKeypair.publicKey;

  console.log(`Program Id to interact with is: ${programId.toBase58()}`);
}


export async function configureClientAccount(accountSpaceSize: number) {
  const SEED = 'test1'
  clientPubkey = await PublicKey.createWithSeed(
    localKeypair.publicKey,
    SEED,
    programId,
  );

  console.log(`Client account's address is:`);
  console.log(`   ${clientPubkey.toBase58()}`);

  // Make sure it doesnt exist already
  const clientAccount = await connection.getAccountInfo(clientPubkey);
  if (clientAccount === null) {
    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: localKeypair.publicKey,
        basePubkey: localKeypair.publicKey,
        seed: SEED,
        newAccountPubkey: clientPubkey,
        lamports: await connection.getMinimumBalanceForRentExemption(accountSpaceSize),
        space: accountSpaceSize,
        programId,
      }),
    );

    await sendAndConfirmTransaction(connection, transaction, [localKeypair]);
    console.log(`Client account created successfully.`);
  } else {
    console.log(`Client account already exists. We can just use it`);
  }
}

/**
 * Ping the program
 */
export async function pingProgram(programName: string) {
  console.log(`All right, let's run it`);
  console.log(`Pinging ${programName} program`);

  const instruction = new TransactionInstruction({
    keys: [{pubkey: clientPubkey, isSigner: false, isWritable: true}],
    programId,
    data: Buffer.alloc(0), // Empty instruction data
  })
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [localKeypair],
  );

  console.log('Ping successful');
}

/**
 * Running the main script
 */
export async function main(programName: string, accountSpaceSize: number) {
  await connect();
  await getLocalAccount();
  await getProgram(programName);
  await configureClientAccount(accountSpaceSize);
  await pingProgram(programName);
}