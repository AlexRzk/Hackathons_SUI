"use client";

import Image from 'next/image';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import type { SuiClient } from '@mysten/sui/client';
import {
  EGG_PRICES_CIM,
  EGG_RARITIES,
  RARITY_IMAGES,
  RARITY_LABELS,
  type EggRarity,
  formatCim,
} from '@/src/config/sui';
import { buildBuyEggTx } from '@/src/lib/buildBuyEggTx';
import { CIM_COIN_TYPE } from '@/src/config/chimera';

const RARITY_STYLES: Record<
  EggRarity,
  {
    gradient: string;
    glow: string;
    aura: string;
    tag: string;
  }
> = {
  common: {
    gradient: 'from-[#9ca3af]/30 via-[#6b7280]/20 to-transparent',
    glow: 'bg-[#9ca3af]/25',
    aura: 'bg-[#9ca3af]/30',
    tag: 'bg-[#9ca3af]/20 text-slate-50',
  },
  rare: {
    gradient: 'from-[#38bdf8]/40 via-[#2563eb]/30 to-transparent',
    glow: 'bg-[#38bdf8]/35',
    aura: 'bg-[#38bdf8]/30',
    tag: 'bg-[#2563eb]/25 text-sky-50',
  },
  epic: {
    gradient: 'from-[#c084fc]/40 via-[#a855f7]/30 to-transparent',
    glow: 'bg-[#c084fc]/35',
    aura: 'bg-[#d8b4fe]/30',
    tag: 'bg-[#a855f7]/25 text-fuchsia-50',
  },
  legendary: {
    gradient: 'from-[#fcd34d]/40 via-[#f59e0b]/30 to-transparent',
    glow: 'bg-[#fcd34d]/35',
    aura: 'bg-[#fbbf24]/30',
    tag: 'bg-[#f59e0b]/25 text-amber-900',
  },
};

const EGG_TIERS: ReadonlyArray<{
  rarity: EggRarity;
  title: string;
  description: string;
}> = [
  {
    rarity: 'common',
    title: 'Common Egg',
    description: 'Starter genome with balanced traits for new Keepers.',
  },
  {
    rarity: 'rare',
    title: 'Rare Egg',
    description: 'Enhanced DNA pool with elevated $AGI vectors.',
  },
  {
    rarity: 'epic',
    title: 'Epic Egg',
    description: 'Lab-forged mutations and battle-ready potential.',
  },
  {
    rarity: 'legendary',
    title: 'Legendary Egg',
    description: 'Mythic strain imbued with volatile, high-yield traits.',
  },
];

const SUI_EXPLORER_BASE_URL = 'https://suiexplorer.com/txblock/';

type MintStatus =
  | { state: 'idle' }
  | { state: 'pending'; hint?: string }
  | { state: 'success'; digest: string }
  | { state: 'error'; hint: string };

const createInitialStatuses = (): Record<EggRarity, MintStatus> =>
  EGG_RARITIES.reduce<Record<EggRarity, MintStatus>>((map, rarity) => {
    map[rarity] = { state: 'idle' };
    return map;
  }, {} as Record<EggRarity, MintStatus>);

async function findCoinCoveringPrice({
  client,
  owner,
  price,
}: {
  client: SuiClient;
  owner: string;
  price: bigint;
}) {
  let cursor: string | null | undefined = null;

  while (true) {
    const { data, hasNextPage, nextCursor } = await client.getCoins({
      owner,
      coinType: CIM_COIN_TYPE,
      cursor,
      limit: 50,
    });

    const match = data.find((coin) => BigInt(coin.balance) >= price);
    if (match) {
      return match.coinObjectId;
    }

    if (!hasNextPage || !nextCursor) {
      return null;
    }

    cursor = nextCursor;
  }
}

export function EggMintGrid() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [mintStatuses, setMintStatuses] = useState<Record<EggRarity, MintStatus>>(createInitialStatuses);

  const shortAddress = useMemo(() => {
    if (!account) {
      return null;
    }
    return `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
  }, [account]);

  const updateStatus = useCallback((rarity: EggRarity, next: MintStatus) => {
    setMintStatuses((prev) => ({
      ...prev,
      [rarity]: next,
    }));
  }, []);

  const handleMint = useCallback(
    async (rarity: EggRarity) => {
      if (!account) {
        updateStatus(rarity, {
          state: 'error',
          hint: 'Connect your wallet to mint eggs.',
        });
        return;
      }

      updateStatus(rarity, { state: 'pending', hint: 'Searching for CIM coins…' });

      try {
        const price = EGG_PRICES_CIM[rarity];
        const coinObjectId = await findCoinCoveringPrice({
          owner: account.address,
          price,
          client,
        });

        if (!coinObjectId) {
          throw new Error('No CIM coin large enough. Mint or merge CIM first.');
        }

        updateStatus(rarity, { state: 'pending', hint: 'Awaiting wallet signature…' });

        const tx = buildBuyEggTx(rarity, coinObjectId);
        const result = await signAndExecuteTransaction({ transaction: tx });
        const digest = 'digest' in result ? result.digest : undefined;

        if (!digest) {
          throw new Error('Transaction digest missing in response.');
        }

        updateStatus(rarity, { state: 'success', digest });
      } catch (error) {
        const hint =
          error instanceof Error
            ? error.message.replace('Error: ', '')
            : 'Mint failed. Please retry.';
        updateStatus(rarity, { state: 'error', hint });
      }
    },
    [account, client, signAndExecuteTransaction, updateStatus],
  );

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {EGG_TIERS.map((tier) => {
          const styles = RARITY_STYLES[tier.rarity];
          const price = EGG_PRICES_CIM[tier.rarity];
          const mintState = mintStatuses[tier.rarity];
          const isPending = mintState.state === 'pending';
          const label = RARITY_LABELS[tier.rarity];
          const priceLabel = formatCim(price);

          return (
            <div
              key={tier.rarity}
              className={clsx(
                'group relative rounded-3xl bg-gradient-to-br p-[1.5px] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01]',
                styles.gradient,
              )}
            >
              <div
                className={clsx(
                  'pointer-events-none absolute inset-0 rounded-3xl opacity-50 blur-3xl transition-opacity group-hover:opacity-90',
                  styles.glow,
                )}
                aria-hidden
              />
              <div className="relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0c1b]/90 p-6 text-center">
                <div className="relative h-40 w-32 sm:h-48 sm:w-36">
                  <div
                    className={clsx(
                      'absolute -inset-x-8 bottom-1 top-10 rounded-full opacity-70 blur-3xl transition group-hover:opacity-100',
                      styles.aura,
                    )}
                    aria-hidden
                  />
                  <div className="relative h-full w-full">
                    <Image
                      src={RARITY_IMAGES[tier.rarity]}
                      alt={tier.title}
                      fill
                      sizes="(max-width: 640px) 45vw, 20vw"
                      className="object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
                      priority={tier.rarity === 'legendary'}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', styles.tag)}>
                    {label}
                  </span>
                  <p className="text-xs text-white/70">{tier.description}</p>
                </div>
                <div className="mt-auto w-full space-y-2">
                  <button
                    type="button"
                    onClick={() => handleMint(tier.rarity)}
                    disabled={isPending}
                    className={clsx(
                      'w-full rounded-xl px-4 py-2 text-sm font-semibold transition',
                      isPending ? 'bg-white/10 text-white/70' : 'bg-[#330df2] text-white hover:bg-[#4a3bff]',
                    )}
                  >
                    {isPending ? 'Minting…' : `Mint for ${priceLabel}`}
                  </button>
                  {mintState.state === 'success' && (
                    <a
                      href={`${SUI_EXPLORER_BASE_URL}${mintState.digest}?network=testnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80 transition hover:border-[#330df2] hover:text-white"
                    >
                      Minted! View on Sui Explorer
                    </a>
                  )}
                  {mintState.state === 'pending' && (
                    <p className="text-xs text-white/70">{mintState.hint ?? 'Processing transaction…'}</p>
                  )}
                  {mintState.state === 'error' && (
                    <p className="text-xs text-rose-300">{mintState.hint}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
