export const SUI_PACKAGE_ID =
  process.env.NEXT_PUBLIC_SUI_PACKAGE_ID ??
  '0xd410613c61e0cc0be8b4fc588e96334232d7377f975b2465237e4296af62705e';

export const SUI_RPC_URL =
  process.env.NEXT_PUBLIC_SUI_RPC_URL ?? 'https://fullnode.testnet.sui.io:443';

export type EggRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const EGG_RARITIES: readonly EggRarity[] = ['common', 'rare', 'epic', 'legendary'] as const;

export const HATCHERY_RARITY_CODE: Record<EggRarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const EGG_PRICES_CIM: Record<EggRarity, bigint> = {
  common: 100n,
  rare: 500n,
  epic: 1_000n,
  legendary: 5_000n,
};

export const RARITY_LABELS: Record<EggRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const RARITY_IMAGE_BASE = process.env.NEXT_PUBLIC_RARITY_IMAGE_BASE ?? '/api/rarity-art?rarity=';

export const RARITY_IMAGES: Record<EggRarity, string> = {
  common: `${RARITY_IMAGE_BASE}common`,
  rare: `${RARITY_IMAGE_BASE}rare`,
  epic: `${RARITY_IMAGE_BASE}epic`,
  legendary: `${RARITY_IMAGE_BASE}legendary`,
};

export const MIST_PER_SUI = 1_000_000_000n;

export function formatMistToSui(value: bigint, fractionDigits = 2): string {
  const sui = Number(value) / Number(MIST_PER_SUI);
  return `${sui.toFixed(fractionDigits)} SUI`;
}

export function formatCim(amount: bigint): string {
  return `${amount.toString()} CIM`;
}
