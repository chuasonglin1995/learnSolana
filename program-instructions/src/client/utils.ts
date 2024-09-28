import {Keypair} from '@solana/web3.js';
import fs from 'mz/fs';
import * as BufferLayout from '@solana/buffer-layout';
import { Buffer } from 'buffer';

/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export async function createKeypairFromFile(
  filePath: string,
): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

// What this function do is to create a buffer that will be used to send the instruction to the program
export async function createCalculatorInstructions(
  operation: number, operating_value:number): Promise<Buffer> {
    
    // packing instructions
    const bufferLayout: BufferLayout.Structure<any> = BufferLayout.struct(
      [
        BufferLayout.u8('operation'),
        BufferLayout.u32('operating_value'),
      ]
    );

    // allocate memory for the buffer
    // think of buffer as an empty box that you will put the data in
    const buffer = Buffer.alloc(bufferLayout.span);

    // encode the data to the buffer
    // i.e packs the object into the empty box
    bufferLayout.encode({
      operation: operation,
      operating_value
    }, buffer);

    return buffer
}

export async function getStringForInstruction(
  operation: number, operating_value: number
) {
  if (operation == 0) {
    return "reset the exmaple";
  } else if (operation == 1) {
    return `add: ${operating_value}`;
  } else if (operation == 2) {
    return `subtract: ${operating_value}`;
  } else if (operation == 3) {
    return `multiply by: ${operating_value}`;
  }
}
