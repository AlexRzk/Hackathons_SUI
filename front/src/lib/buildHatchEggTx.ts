import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, CLOCK_ID } from '../config/chimera';

export function buildHatchEggTx(eggId: string, monsterName: string) {
  const tx = new Transaction();
  const nameBytes = Array.from(new TextEncoder().encode(monsterName));

  tx.moveCall({
    target: `${PACKAGE_ID}::monster_hatchery::hatch_egg`,
    arguments: [
      tx.object(eggId),
      tx.object(CLOCK_ID),
      tx.pure.vector('u8', nameBytes),
    ],
  });

  return tx;
}
