// src/lib/buildBuyEggTx.ts

import { Transaction } from '@mysten/sui/transactions';
import { HATCHERY_RARITY_CODE, type EggRarity } from '../config/sui';
import { PACKAGE_ID, SHOP_ID } from '../config/chimera';

export function buildBuyEggTx(rarity: EggRarity, coinObjectId: string) {
  const tx = new Transaction();
  const rarityCode = HATCHERY_RARITY_CODE[rarity];

  if (rarityCode === undefined) {
    throw new Error(`Invalid rarity: ${rarity}`);
  }

  tx.moveCall({
    target: `${PACKAGE_ID}::monster_hatchery::buy_egg`,
    arguments: [
      tx.object(SHOP_ID),
      tx.object(coinObjectId),
      tx.pure.u8(rarityCode),
    ],
  });

  return tx;
}
