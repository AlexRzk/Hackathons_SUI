'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWalletMonsters } from '@/src/lib/useWalletMonsters';

type SortKey = 'rarity' | 'level' | 'agi' | 'int' | 'pow' | 'name';

const RARITY_ORDER: Record<string, number> = {
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Common: 1,
  Unknown: 0,
};

const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string; description: string }> = [
  { key: 'rarity', label: 'Rarity (Mythic → Common)', description: 'Legendary monsters float to the top.' },
  { key: 'level', label: 'Level (High → Low)', description: 'Your most seasoned monsters first.' },
  { key: 'pow', label: '$POW (High → Low)', description: 'Strength specialists first.' },
  { key: 'agi', label: '$AGI (High → Low)', description: 'Speedsters first.' },
  { key: 'int', label: '$INT (High → Low)', description: 'Tacticians first.' },
  { key: 'name', label: 'Name (A → Z)', description: 'Alphabetical order.' },
];

function compareMonsters(a: ReturnType<typeof useWalletMonsters>['monsters'][number], b: typeof a, key: SortKey) {
  switch (key) {
    case 'rarity':
      return (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0) || b.level - a.level;
    case 'level':
      return b.level - a.level || (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
    case 'pow':
      return b.stats.pow - a.stats.pow || b.level - a.level;
    case 'agi':
      return b.stats.agi - a.stats.agi || b.level - a.level;
    case 'int':
      return b.stats.int - a.stats.int || b.level - a.level;
    case 'name':
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    default:
      return 0;
  }
}

export default function LabPage() {
  const account = useCurrentAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rarity');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const { monsters, isPending, isError, error, refetch, count } = useWalletMonsters(account?.address);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    }

    if (isSortMenuOpen) {
      document.addEventListener('mousedown', handleClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isSortMenuOpen]);

  const filteredMonsters = useMemo(() => {
    if (!searchTerm.trim()) {
      return monsters;
    }

    const matcher = searchTerm.trim().toLowerCase();
    return monsters.filter((monster) => {
      return (
        monster.name.toLowerCase().includes(matcher) ||
        monster.displayId.toLowerCase().includes(matcher) ||
        monster.objectId.toLowerCase().includes(matcher)
      );
    });
  }, [monsters, searchTerm]);

  const sortedMonsters = useMemo(() => {
    return [...filteredMonsters].sort((a, b) => compareMonsters(a, b, sortKey));
  }, [filteredMonsters, sortKey]);

  const activeSort = SORT_OPTIONS.find((option) => option.key === sortKey) ?? SORT_OPTIONS[0];

  const showEmptyState = !isPending && !isError && sortedMonsters.length === 0;

  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        {!account ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <div
              className="h-64 w-full max-w-sm rounded-2xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTSTJVY2mg87H1Uvxd1pP4xt4AUF3lJHlrB1GxsBgxxCL_pJvkM4APBoRSTX5LVciG0-LqkpB57pmKloG8JwT-XiXPHDvODkvPW7u0_pa63QrZ0cMtIRz-v9UGmRU_KymaI9Tnhhzve5nnQxuu1rB75LDsJf4zzntDZqQyf5IMilgy-Fm8a_WhVH3_ixDGl3Ffqd-gEbgUPX9M1goKJARbf3KiaOpCFOdZlWdJfVW0YzoWvxGiOpgGm5RX224GZbq6dWH4Uy9itSQ')",
                filter: 'hue-rotate(180deg) brightness(0.85)',
              }}
            />
            <div className="max-w-md space-y-2">
              <p className="text-2xl font-bold">Access Your Genetics Lab</p>
              <p className="text-white/70">Connect your wallet to view and manage your monster collection.</p>
            </div>
            <WalletConnectButton className="h-12" />
          </section>
        ) : (
          <section className="space-y-8">
            <header className="space-y-3">
              <p className="text-4xl font-black">My Monster Collection</p>
              <p className="text-white/70">
                {isPending
                  ? 'Syncing your lab inventory…'
                  : `Showing ${sortedMonsters.length} / ${count} on-chain monsters`}
              </p>
            </header>
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <label className="relative w-full md:max-w-sm">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-white placeholder:text-white/50"
                  />
                </label>
                <div className="flex flex-wrap gap-3" ref={sortMenuRef}>
                  <div className="relative">
                    <button
                      onClick={() => setIsSortMenuOpen((open) => !open)}
                      className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/80"
                    >
                      <span className="material-symbols-outlined text-base">swap_vert</span>
                      <span>Sort: {activeSort.label}</span>
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                    {isSortMenuOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-white/10 bg-[#18122f] p-2 shadow-2xl">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                              option.key === sortKey ? 'bg-white/10' : ''
                            }`}
                            onClick={() => {
                              setSortKey(option.key);
                              setIsSortMenuOpen(false);
                            }}
                          >
                            <span>
                              <span className="block font-semibold text-white">{option.label}</span>
                              <span className="text-xs text-white/60">{option.description}</span>
                            </span>
                            {option.key === sortKey && (
                              <span className="material-symbols-outlined text-base text-[#8d7bff]">check_circle</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/80"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    <span>{isPending ? 'Refreshing…' : 'Refresh'}</span>
                  </button>
                </div>
              </div>
              {isError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                  <p className="font-semibold">Unable to load your monsters.</p>
                  <p className="text-red-200">{error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
              )}
              {isPending && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-80 animate-pulse rounded-xl bg-white/10" />
                  ))}
                </div>
              )}
              {showEmptyState ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
                  <p className="text-xl font-semibold">No monsters detected</p>
                  <p className="max-w-md text-white/70">
                    Mint an egg, hatch it, and refresh this dashboard to see your on-chain genetics populate the lab.
                  </p>
                  <Link
                    href="/"
                    className="rounded-full bg-[#330df2] px-6 py-2 text-sm font-semibold shadow-lg shadow-[#330df2]/40"
                  >
                    Mint your first egg
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedMonsters.map((monster) => (
                    <div
                      key={monster.objectId}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-[#330df2]"
                    >
                      <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${monster.image})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 space-y-3 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-bold">{monster.name}</p>
                            <p className="text-xs text-white/70">{monster.displayId}</p>
                            <p className="text-xs text-white/60">Level {monster.level}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${monster.rarityClass}`}>
                            {monster.rarity}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 text-sm text-white/80">
                          <StatPill label="directions_run" value={monster.stats.agi} />
                          <StatPill label="psychology" value={monster.stats.int} />
                          <StatPill label="local_fire_department" value={monster.stats.pow} />
                        </div>
                      </div>
                      <Link
                        href={`/monsters/${monster.objectId}`}
                        className="absolute inset-0 flex items-center justify-center bg-[#330df2]/80 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className="material-symbols-outlined text-sm text-cyan-300">{label}</span>
      <span>{value}</span>
    </div>
  );
}
