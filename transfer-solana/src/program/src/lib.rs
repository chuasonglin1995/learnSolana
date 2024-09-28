use {
    std::convert::TryInto,
    solana_program::{
        account_info::{
            next_account_info, AccountInfo
        },
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program::invoke,
        program_error::ProgramError,
        pubkey::Pubkey,
        system_instruction,
    },
};
entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    let sender = next_account_info(accounts_iter)?;
    let receiver = next_account_info(accounts_iter)?;

    let amount = instruction_data
        .get(0..8) // Get the first 8 bytes
        .and_then(|slice| slice.try_into().ok()) // Convert to [u8; 8] - array of 8 bytes
        .map(u64::from_le_bytes) // Convert to u64
        .ok_or(ProgramError::InvalidInstructionData)?; // Handle errors


    msg!("Transfer {} tokens from {} to {}", amount, sender.key, receiver.key);
    msg!("Transfering ...");

    invoke(
        &system_instruction::transfer(
            sender.key,
            receiver.key,
            amount,
        ),
        &[
            sender.clone(),
            receiver.clone(),
        ],
    )?;

    msg!("Transfer completed successfully");
    Ok(())
}