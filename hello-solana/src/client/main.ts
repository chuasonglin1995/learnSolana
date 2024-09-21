import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';

/**
 * Keypair we use to create the on-chain Rust program
 */
const PROGRAM_KEYPAIR_PATH = path.join(
  path.resolve(__dirname, '../../dist/program'),
  'program-keypair.json',
);

async function main() {

  console.log("Launching client...");

  /**
   * Connect to Solana Dev Cluster
   */
  let connection = new Connection('https://api.devnet.solana.com', 'confirmed')

  /**
   * Get our program's keypair
   */
  const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, 'utf-8');
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const programKeypair = Keypair.fromSecretKey(secretKey);
  let programId: PublicKey = programKeypair.publicKey;

  /**
   * Generating an account (keypair) to transaction with our program
   */
  const triggerKeypair = Keypair.generate();
  const airdropRequest = await connection.requestAirdrop(
    triggerKeypair.publicKey,
    LAMPORTS_PER_SOL,
  );
  // Use the new TransactionConfirmationStrategy
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: airdropRequest,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  });

  /**
   * Conduct a transactions with our program
   */
  console.log('-- Pinging Program', programId.toBase58());
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: triggerKeypair.publicKey, isSigner: false, isWritable: true }],
    programId,
    data: Buffer.alloc(0),
  })
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [triggerKeypair],
    { commitment: 'confirmed' },
  );
}

main()
