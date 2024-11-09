use {
	anchor_lang::{
		prelude::*,
	},
	anchor_spl::{
		associated_token::AssociatedToken,
		token::{self, Token},
	},
}




pub fn sell(
	ctx: Context<SellNft>,r
	sale_lamports: u64
) -> Result<()> {
	



}

#[derive(Accounts)]
pub struct SellNft<'info> {
	#[account(mut)]
	pub mint: Account<'info, token::Mint>,
	#[account(mut)]
	pub owner_token_account: UncheckedAccount<'info>,
	#[account(mut)]
	pub owner_authority: Signer<'info>,
	/// CHECK: We're about to create this with Anchor
	#[account(mut)]
	pub buyer_token_account: UncheckedAccount<'info>,
	#[account(mut)]
	pub buyer_authority: Signer<'info>,
	pub rent: Sysvar<'info, Rent>,
	pub system_program: Program<'info, System>,
	pub token_program: Program<'info, Token>,
	pub associated_token_program: Program<'info, AssociatedToken>,
}
