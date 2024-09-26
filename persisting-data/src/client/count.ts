import * as borsh from 'borsh';
import * as math from './math';

// These first few steps are just to get the accountSpaceSize required
class MathStuffCount {
  count = 0;
  constructor(fields: {count: number} | undefined = undefined) {
    if (fields) {
      this.count = fields.count;
    }
  }
}

const MathStuffCountSchema = new Map([
  [MathStuffCount, {kind: 'struct', fields: [['count', 'u32']]}],
]);

const MATH_STUFF_SIZE = borsh.serialize(
  MathStuffCountSchema,
  new MathStuffCount(),
).length;


async function main() {
  await math.example('program_count', MATH_STUFF_SIZE);
}

main().then(
    () => process.exit(),
    err => {
      console.error(err);
      process.exit(-1);
    },
  );