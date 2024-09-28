use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CalculatorInstructions {
  operation: u8,
  operation_value: u32,
}

impl CalculatorInstructions {
  pub fn evaluate(self, value: u32) -> u32 {
    match &self.operation {
      1 => value + &self.operation_value,
      2 => value - &self.operation_value,
      3 => value * &self.operation_value,
      _ => value * 0,
    }
  }
}