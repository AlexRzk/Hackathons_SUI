"use client";

import type { DragEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWalletMonsters, type WalletMonster } from '@/src/lib/useWalletMonsters';

const SLOT_COUNT = 3;
const STORAGE_PREFIX = 'chimera-team-slots';

type SlotId = string | null;

type TeamSlotProps = {
  monster: WalletMonster | null;
  slotIndex: number;
  isDragActive: boolean;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
};

type CollectionCardProps = {
  monster: WalletMonster;
  isAssigned: boolean;
  onAssign: () => void;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
};

export default function TeamPage() {
  const account = useCurrentAccount();
  return <TeamPageContent key={account?.address ?? 'anon'} account={account} />;
}

function TeamPageContent({ account }: { account: ReturnType<typeof useCurrentAccount> }) {
  const storageKey = account?.address ? `${STORAGE_PREFIX}-${account.address}` : null;
  const [slotIds, setSlotIds] = useState<SlotId[]>(() => loadSlots(storageKey));
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const { monsters, isPending, isError, error, refetch, count } = useWalletMonsters(account?.address);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(slotIds));
    }
  }, [slotIds, storageKey]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMonsters = useMemo(() => {
    if (!normalizedSearch) {
      return monsters;
    }

    return monsters.filter((monster) =>
      [monster.name, monster.displayId, monster.objectId].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [monsters, normalizedSearch]);

  const teamSlots = useMemo(
    () => slotIds.map((id) => monsters.find((monster) => monster.objectId === id) ?? null),
    [slotIds, monsters],
  );

  const assignedIds = useMemo(() => new Set(slotIds.filter((id): id is string => Boolean(id))), [slotIds]);

  const assignMonsterToSlot = useCallback((slotIndex: number, monsterId: string) => {
    setSlotIds((prev) => {
      const next = [...prev];
      const currentIndex = prev.findIndex((id) => id === monsterId);
      if (currentIndex !== -1) {
        next[currentIndex] = null;
      }
      next[slotIndex] = monsterId;
      return next;
    });
  }, []);

  const assignToFirstAvailable = useCallback(
    (monsterId: string) => {
      const emptySlot = slotIds.findIndex((id) => !id);
      assignMonsterToSlot(emptySlot === -1 ? 0 : emptySlot, monsterId);
    },
    [assignMonsterToSlot, slotIds],
  );

  const handleDrop = useCallback(
    (slotIndex: number, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const monsterId = event.dataTransfer.getData('text/plain');
      if (monsterId) {
        assignMonsterToSlot(slotIndex, monsterId);
      }
      setDraggedId(null);
    },
    [assignMonsterToSlot],
  );

  const handleRemove = useCallback((slotIndex: number) => {
    setSlotIds((prev) => prev.map((value, index) => (index === slotIndex ? null : value)));
  }, []);

  const handleDragStart = useCallback((event: DragEvent<HTMLElement>, monsterId: string) => {
    event.dataTransfer.setData('text/plain', monsterId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedId(monsterId);
  }, []);

  const handleDragEnd = useCallback(() => setDraggedId(null), []);

  const emptyCollection = !isPending && filteredMonsters.length === 0;

  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        {!account ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
            <div className="max-w-lg space-y-3">
              <p className="text-3xl font-black">Connect to assemble your squad</p>
              <p className="text-white/70">
                Access team management features by linking your wallet. Draft monsters, save parties, and prep for ranked battles once connected.
              </p>
            </div>
            <WalletConnectButton className="h-12" />
          </section>
        ) : (
          <>
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-6">
              <div className="space-y-2">
                <p className="text-4xl font-black leading-tight">Assemble Your Squad</p>
                <p className="text-white/70">Drag cards into slots or tap Assign to set your active lineup.</p>
              </div>
              <button
                onClick={() => refetch()}
                className="h-12 rounded-lg border border-white/20 px-8 text-base font-bold transition hover:bg-white/10"
              >
                Refresh Wallet
              </button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5">
              <header className="flex flex-wrap items-center justify-between gap-4 px-5 pb-3 pt-5">
                <h2 className="text-2xl font-bold tracking-tight">Active Battle Team</h2>
                <p className="text-sm text-white/60">{teamSlots.filter(Boolean).length} / {SLOT_COUNT} slots filled</p>
              </header>
              <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {teamSlots.map((monster, index) => (
                  <TeamSlotCard
                    key={`slot-${index}`}
                    monster={monster}
                    slotIndex={index}
                    isDragActive={Boolean(draggedId && draggedId !== monster?.objectId)}
                    onDrop={(event) => handleDrop(index, event)}
                    onRemove={() => handleRemove(index)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-3 pt-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">My Monster Collection</h2>
                  <p className="text-sm text-white/60">
                    {isPending ? 'Syncing wallet…' : `Showing ${filteredMonsters.length} / ${count} monsters`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="material-symbols-outlined text-base">info</span>
                  <p>Tip: drag a card or use Assign</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 px-5 pb-3 sm:flex-row">
                <label className="relative w-full sm:flex-1">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or object"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-12 w-full rounded-lg border border-white/15 bg-[#1d1b27] pl-10 pr-4 text-sm text-white placeholder:text-white/50"
                  />
                </label>
                <div className="flex w-full flex-col gap-3 text-sm text-white/70 sm:w-64">
                  <button
                    onClick={() => refetch()}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#1d1b27] px-4"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    <span>Reload inventory</span>
                  </button>
                </div>
              </div>
              {isError && (
                <div className="mx-5 mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                  <p className="font-semibold">Unable to load your monsters.</p>
                  <p className="text-red-200">{error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
              )}
              {isPending ? (
                <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-72 animate-pulse rounded-xl bg-white/10" />
                  ))}
                </div>
              ) : emptyCollection ? (
                <div className="m-5 flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center">
                  <p className="text-lg font-semibold">No monsters detected</p>
                  <p className="max-w-md text-white/70">
                    Mint an egg, hatch it in the Genetics Lab, then return here to build your squad.
                  </p>
                  <Link
                    href="/"
                    className="rounded-full bg-[#330df2] px-6 py-2 text-sm font-semibold shadow-lg shadow-[#330df2]/40"
                  >
                    Mint an Egg
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMonsters.map((monster) => (
                    <CollectionCard
                      key={monster.objectId}
                      monster={monster}
                      isAssigned={assignedIds.has(monster.objectId)}
                      onAssign={() => assignToFirstAvailable(monster.objectId)}
                      onDragStart={(event) => handleDragStart(event, monster.objectId)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function TeamSlotCard({ monster, slotIndex, isDragActive, onDrop, onRemove }: TeamSlotProps) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className={`relative flex aspect-[3/4] flex-col justify-end gap-3 rounded-xl border-2 border-dashed p-4 transition ${
        isDragActive ? 'border-[#330df2] bg-white/10' : 'border-white/20 bg-white/5'
      }`}
    >
      {monster ? (
        <>
          <button
            onClick={onRemove}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div
            className="absolute inset-0 -z-10 rounded-xl opacity-40"
            style={{ backgroundImage: `url(${monster.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div>
            <p className="text-xl font-bold">{monster.name}</p>
            <p className="text-sm text-white/70">Level {monster.level}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold">{monster.rarity}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">$POW {monster.stats.pow}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">$AGI {monster.stats.agi}</span>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-white/60">
          <span className="material-symbols-outlined mb-2 text-5xl text-white/40">add_circle</span>
          <p className="text-lg font-bold">Slot {slotIndex + 1}</p>
          <p className="text-sm">Drag a monster card here</p>
        </div>
      )}
    </div>
  );
}

function CollectionCard({ monster, isAssigned, onAssign, onDragStart, onDragEnd }: CollectionCardProps) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group relative overflow-hidden rounded-xl border-2 border-transparent bg-[#1a1a2e] transition hover:border-[#330df2]/70 ${
        isAssigned ? 'ring-2 ring-[#330df2]/60' : ''
      }`}
    >
      {isAssigned && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[#330df2] px-2 py-1 text-xs font-bold">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          In Team
        </div>
      )}
      <div
        className="aspect-square"
        style={{ backgroundImage: `url(${monster.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold">{monster.name}</p>
            <p className="text-sm text-white/60">{monster.displayId} · Level {monster.level}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${monster.rarityClass}`}>{monster.rarity}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-3 text-sm text-white/70">
          <span>
            $AGI <strong className="text-white">{monster.stats.agi}</strong>
          </span>
          <span>
            $INT <strong className="text-white">{monster.stats.int}</strong>
          </span>
          <span>
            $POW <strong className="text-white">{monster.stats.pow}</strong>
          </span>
        </div>
        <button
          onClick={onAssign}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-base">login</span>
          <span>{isAssigned ? 'Move slot' : 'Assign to team'}</span>
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 border border-white/5 opacity-0 transition group-hover:opacity-100" />
    </article>
  );
}

function loadSlots(storageKey: string | null): SlotId[] {
  if (typeof window === 'undefined' || !storageKey) {
    return Array(SLOT_COUNT).fill(null);
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return Array(SLOT_COUNT).fill(null);
  }

  try {
    const parsed = JSON.parse(raw) as SlotId[];
    if (Array.isArray(parsed) && parsed.length === SLOT_COUNT) {
      return parsed;
    }
  } catch {
    /* swallow */
  }

  return Array(SLOT_COUNT).fill(null);
}
