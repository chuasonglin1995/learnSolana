use {
    anchor_lang::{
        prelude::*,
        solana_program::{native_token::LAMPORTS_PER_SOL, program::invoke},
        system_program,
    },
    anchor_spl::{
        associated_token::{self, AssociatedToken},
        token,
    },
    mpl_token_metadata::{
        instructions::{
            CreateMasterEditionV3, 
            CreateMasterEditionV3InstructionArgs, 
            CreateMetadataAccountV3,
            CreateMetadataAccountV3InstructionArgs,
        },
        types::DataV2,
    },
};

declare_id!("9N9SM8xLvfUj9ABwTwCfmkWoPXpVQZeeS7Lhw1351TpX"); // need to change

#[program]
pub mod mint_nft {
    use super::*;

    pub fn mint(
        ctx: Context<MintNft>,
        metadata_title: String,
        metadata_symbol: String,
        metadata_uri: String,
    ) -> Result<()> {
        // There is a difference between
        // system_program::create_account -> performs actual operation on Solana blockchain
        // system_program::CreateAccount -> just a mod function
        msg!("Creating mint account...");
        msg!("Mint: {}", &ctx.accounts.mint.key());

        // Actually very similar to doing it using solana program too
        system_program::create_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                system_program::CreateAccount {
                    from: ctx.accounts.mint_authority.to_account_info(), // our wallet
                    to: ctx.accounts.mint.to_account_info(),
                },
            ), // add
            LAMPORTS_PER_SOL,                  // lamports
            82,                                // space
            &ctx.accounts.token_program.key(), // owner
        )?;

        msg!("Initializing mint account...");
        msg!("Mint: {}", &ctx.accounts.mint.key());

        let cpi_accounts_initialize_mint = token::InitializeMint2 {
            mint: ctx.accounts.mint.to_account_info(),
        };
        let cpi_context_initialize_mint = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts_initialize_mint,
        );
        token::initialize_mint2(
            cpi_context_initialize_mint,
            0,
            &ctx.accounts.mint_authority.key(),
            Some(&ctx.accounts.mint_authority.key()),
        )?;

        msg!("Creating token account...");
        msg!("Token Address: {}", &ctx.accounts.token_account.key());
        let cpi_ctx_create_token_account = CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            associated_token::Create {
                payer: ctx.accounts.mint_authority.to_account_info(),
                associated_token: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        );
        associated_token::create(cpi_ctx_create_token_account)?;

        msg!("Minting token to token account...");
        msg!("Mint: {}", &ctx.accounts.mint.to_account_info().key());
        msg!("Token Address: {}", &ctx.accounts.token_account.key());

        let ctx_mint_to = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
        );
        token::mint_to(ctx_mint_to, 1)?;

        msg!("Creating metadata account...");
        msg!(
            "Metadata account address: {}",
            &ctx.accounts.metadata.to_account_info().key()
        );

        let ctx_create_metadata_account =
            mpl_token_metadata::instructions::CreateMetadataAccountV3 {
                metadata: ctx.accounts.metadata.key(),
                mint: ctx.accounts.mint.key(),
                mint_authority: ctx.accounts.mint_authority.key(),
                payer: ctx.accounts.mint_authority.key(),
                update_authority: (ctx.accounts.mint_authority.key(), true),
                rent: Some(ctx.accounts.rent.key()),
                system_program: ctx.accounts.system_program.key(),
            };

        invoke(
            &CreateMetadataAccountV3::instruction(
                &ctx_create_metadata_account,
                CreateMetadataAccountV3InstructionArgs {
                    data: DataV2 {
                        name: metadata_title,
                        symbol: metadata_symbol,
                        uri: metadata_uri,
                        uses: None,
                        creators: None,
                        collection: None,
                        seller_fee_basis_points: 0,
                    },
                    is_mutable: true,
                    collection_details: None,
                },
            ),
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("Creating master edition metadata account...");
        msg!(
            "Master edition metadata account address: {}",
            &ctx.accounts.master_edition.to_account_info().key()
        );

        let ctx_create_master_edition_metadata_account =
            mpl_token_metadata::instructions::CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.key(),
                metadata: ctx.accounts.metadata.key(),
                mint: ctx.accounts.mint.key(),
                mint_authority: ctx.accounts.mint_authority.key(),
                payer: ctx.accounts.mint_authority.key(),
                update_authority: ctx.accounts.mint_authority.key(),
                token_program: ctx.accounts.token_program.key(),
                rent: Some(ctx.accounts.rent.key()),
                system_program: ctx.accounts.system_program.key(),
            };

        invoke(
            &CreateMasterEditionV3::instruction(
                &ctx_create_master_edition_metadata_account,
                CreateMasterEditionV3InstructionArgs {
                    max_supply: Some(1),
                },
            ),
            &[
                ctx.accounts.master_edition.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        msg!("Token mint process completed successfully.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>, // just another metadata that metaplex uses
    #[account(mut)]
    pub mint: Signer<'info>,
    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}
