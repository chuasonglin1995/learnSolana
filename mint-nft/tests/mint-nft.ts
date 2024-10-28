import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MintNft } from "../target/types/mint_nft";
import { ComputeBudgetProgram } from "@solana/web3.js";

describe("mint-nft", () => {

  const nftTitle  = "NFT by Song";
  const nftSymbol = "NFT";
  const nftBaseUri = "https://raw.githubusercontent.com/chuasonglin1995/learnSolana/refs/heads/main/mint-nft/assets/nft.json";

  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.MintNft as Program<MintNft>;

  // how can i get metaplex tokenId?
  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  it("Mint!", async () => {
    
    // Derive the mint address and associated token account address
    const mintKeyPair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const tokenAddress = anchor.utils.token.associatedAddress({
      mint: mintKeyPair.publicKey,
      owner: wallet.publicKey,
    })
    console.log(`New token: ${mintKeyPair.publicKey}`);

    // Derive the metadata and master edition addresses
    const metadataAddress = (anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeyPair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log("Metadata initialized at: ", metadataAddress);

    const masterEditionAddress = (anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeyPair.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log("Master Edition initialized at: ", masterEditionAddress);

    // Add compute budget instruction to increase compute units limit
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400000, // Increase the compute units limit
    });

    try {
      // Transact with the "mint" method in our on-chain program
      await program.methods.mint(
        nftTitle,
        nftSymbol,
        nftBaseUri,
      )
        .accounts(
          {
            masterEdition: masterEditionAddress,
            metadata: metadataAddress,
            mint: mintKeyPair.publicKey,
            tokenAccount: tokenAddress,
            mintAuthority: wallet.publicKey,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            // anchor will resolve the rest of the accounts
          }
        )
        .preInstructions([computeBudgetIx]) // Add the compute budget instruction
        .signers([mintKeyPair])
        .rpc()
    } catch (err) {
      if (err instanceof anchor.web3.SendTransactionError) {
        console.error("Transaction failed:", err.message);
        const logs = err.logs;
        if (logs) {
          logs.forEach(log => console.error(log));
        }
      } else {
        console.error("Unexpected error:", err);
      }
    }
  });
});
