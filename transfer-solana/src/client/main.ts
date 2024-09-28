import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import path from 'path';
import { readFileSync } from 'fs';
import * as BufferLayout from '@solana/buffer-layout';

/** 
 * Variables
 */
const SOLANA_NETWORK = 'https://api.devnet.solana.com';

let connection: Connection;
let programKeypair: Keypair;
let programId: PublicKey;

let songKeypair: Keypair;
let johnKeypair: Keypair;

/**
 * Helper functions
 */
function createKeypairFromFile(filePath: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(filePath, {encoding: 'utf8'})))
  );
}

async function sendLamports(from: Keypair, to: PublicKey, amount: number) {

  // Essentially the same as:
  //   const layout = BufferLayout.ns64("value");
  //   const data = Buffer.alloc(layout.span);
  //   layout.encode(amount, data);
  let data = Buffer.alloc(8) // 8 bytes
  BufferLayout.ns64("value").encode(amount, data);
  
  let ins = new TransactionInstruction({
    keys: [
      { pubkey: from.publicKey, isSigner: true, isWritable: false },
      { pubkey: to, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: programId,
    data: data
  });

  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(ins),
    [from]
  )
}

/**
 * Main
 */
async function main() {
  connection = new Connection(
    SOLANA_NETWORK,
    'confirmed'
  );
  
  programKeypair = createKeypairFromFile(
    path.join(
      path.resolve(__dirname, '../../dist/program'),
      'program-keypair.json'
    )
  );

  programId = programKeypair.publicKey

  songKeypair = createKeypairFromFile(path.resolve(__dirname, "../../accounts/song.json"));
  johnKeypair = createKeypairFromFile(path.resolve(__dirname, "../../accounts/john.json"));

  // John sends some SOL to the Song
  console.log("Sending some SOL from John to the Song...");
  console.log(`[Before] Song's balance: ${await connection.getBalance(songKeypair.publicKey) / LAMPORTS_PER_SOL} SOL`);
  console.log(`[Before] John's balance: ${await connection.getBalance(johnKeypair.publicKey) / LAMPORTS_PER_SOL} SOL`);
  await sendLamports(johnKeypair, songKeypair.publicKey, 0.01 * LAMPORTS_PER_SOL);

  console.log(`[After] Song's balance: ${await connection.getBalance(songKeypair.publicKey) / LAMPORTS_PER_SOL} SOL`);
  console.log(`[After] John's balance: ${await connection.getBalance(johnKeypair.publicKey) / LAMPORTS_PER_SOL} SOL`);
}

main().then(
  () => process.exit(),
  err => {
      console.error(err);
      process.exit(-1);
  },
);