'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import {
  BattleMonster,
  BattleResult,
  BattleAction,
  demoOpponents,
  demoRoster,
  simulateBattle,
} from '@/src/lib/battle/simulator';
import { type WalletMonster, useWalletMonsters } from '@/src/lib/useWalletMonsters';

interface BattleMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatAction = (action: BattleAction) => action.toLowerCase().replace(/^[a-z]/, (char) => char.toUpperCase());

const actionIcons: Record<BattleAction, string> = {
  [BattleAction.FORCE]: 'sports_martial_arts',
  [BattleAction.INTELLIGENCE]: 'auto_fix_high',
  [BattleAction.AGILITY]: 'sprint',
};

const toBattleMonster = (monster: WalletMonster): BattleMonster => ({
  id: monster.objectId,
  name: monster.name,
  strength: monster.stats.pow,
  agility: monster.stats.agi,
  intelligence: monster.stats.int,
  level: monster.level,
  origin: 'wallet',
});

export function BattleMenu({ isOpen, onClose }: BattleMenuProps) {
  const account = useCurrentAccount();
  const { monsters, isLoading } = useWalletMonsters(account?.address);
  const roster = useMemo(() => {
    if (monsters.length) {
      return monsters.map(toBattleMonster);
    }
    return demoRoster;
  }, [monsters]);

  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [opponentCursor, setOpponentCursor] = useState(0);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedMonster = roster.find((monster) => monster.id === selectedMonsterId) ?? roster[0];
  const opponent = demoOpponents[opponentCursor % demoOpponents.length];

  const closeMenu = () => {
    setBattleResult(null);
    setIsSimulating(false);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const launchBattle = () => {
    if (!selectedMonster) {
      setErrorMessage('Select a monster to engage.');
      return;
    }

    setIsSimulating(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = simulateBattle({ player: selectedMonster, opponent });
      setBattleResult(result);
      setIsSimulating(false);
    }, 250);
  };

  const nextOpponent = () => {
    setOpponentCursor((prev) => (prev + 1) % demoOpponents.length);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeMenu();
        }
      }}
      role="presentation"
    >
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0e0b1a] p-6 text-white shadow-[0_40px_120px_rgba(8,7,17,0.95)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#8b7bff]">Trinity Tactics</p>
            <h2 className="text-2xl font-black">Battle Simulator</h2>
            <p className="text-sm text-white/70">
              Your monster is piloted by the off-chain AI brain, sparring against a scripted opponent for the demo.
            </p>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Select your monster</h3>
              {!account && (
                <p className="text-xs text-white/50">Connect a wallet to surface your actual hatchery.</p>
              )}
            </div>
            {isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                Loading wallet monsters...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {roster.map((monster) => (
                  <button
                    key={monster.id}
                    type="button"
                    onClick={() => {
                      setSelectedMonsterId(monster.id);
                      setBattleResult(null);
                    }}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition hover:border-[#330df2] hover:bg-[#330df2]/10',
                      selectedMonster?.id === monster.id
                        ? 'border-[#330df2] bg-[#330df2]/20'
                        : 'border-white/10 bg-white/5',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                          {monster.origin === 'wallet' ? 'Wallet' : 'Demo'}
                        </p>
                        <p className="text-lg font-semibold">{monster.name}</p>
                      </div>
                      <div className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                        Lvl {monster.level}
                      </div>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-black/40 p-2">
                        <dt className="text-white/50">Force</dt>
                        <dd className="text-lg font-bold text-white">{monster.strength}</dd>
                      </div>
                      <div className="rounded-xl bg-black/40 p-2">
                        <dt className="text-white/50">Agility</dt>
                        <dd className="text-lg font-bold text-white">{monster.agility}</dd>
                      </div>
                      <div className="rounded-xl bg-black/40 p-2">
                        <dt className="text-white/50">Intellect</dt>
                        <dd className="text-lg font-bold text-white">{monster.intelligence}</dd>
                      </div>
                    </dl>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Fake opponent</h3>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#ffb347]">Scripted rival</p>
              <h4 className="text-xl font-semibold">{opponent.name}</h4>
              <p className="text-sm text-white/70">A deterministic sparring partner used for the hackathon demo.</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white/5 p-2">
                  <dt className="text-white/50">Force</dt>
                  <dd className="text-lg font-bold">{opponent.strength}</dd>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <dt className="text-white/50">Agility</dt>
                  <dd className="text-lg font-bold">{opponent.agility}</dd>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <dt className="text-white/50">Intellect</dt>
                  <dd className="text-lg font-bold">{opponent.intelligence}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={nextOpponent}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-[#330df2] hover:text-white"
              >
                <span className="material-symbols-outlined text-base">autorenew</span>
                Switch sparring partner
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              <p className="font-semibold text-white">Why AI?</p>
              <p>
                The agent mirrors the Python battle engine (Trinity Tactics). Your monster predicts the opponent&apos;s dominant stat
                and counters accordingly with intelligence-weighted randomness.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 space-y-4">
          {errorMessage && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{errorMessage}</p>}
          <button
            type="button"
            disabled={isSimulating}
            onClick={launchBattle}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#330df2] px-6 py-4 text-lg font-semibold transition hover:bg-[#4a3bff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-2xl">stadium</span>
            {isSimulating ? 'Running AI battle...' : 'Launch AI Battle'}
          </button>

          {battleResult && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Outcome</p>
                  <p className="text-2xl font-bold">
                    {battleResult.winnerId === selectedMonster?.id ? 'Victory' : 'Defeat'} · {battleResult.totalTurns} turns
                  </p>
                  <p className="text-sm text-white/70">{battleResult.strategyNote}</p>
                </div>
                <div className="rounded-2xl bg-black/40 px-4 py-2 text-center">
                  <p className="text-xs text-white/60">XP Gain</p>
                  <p className="text-2xl font-semibold text-[#ffb347]">+{battleResult.xpGain}</p>
                </div>
              </div>
              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-2 text-sm">
                {battleResult.turns.map((turn) => (
                  <div
                    key={turn.turn}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white/60">Turn {turn.turn}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs">
                        <span className="material-symbols-outlined text-sm">{actionIcons[turn.playerAction]}</span>
                        {formatAction(turn.playerAction)}
                      </span>
                      <span className="text-xs text-white/50">→</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
                        <span className="material-symbols-outlined text-sm">{actionIcons[turn.opponentAction]}</span>
                        {formatAction(turn.opponentAction)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#77ffea]">{turn.damageToOpponent} dmg</span>
                      <span className="text-[#ff9f9f]">{turn.damageToPlayer} dmg</span>
                      <span className="text-white/50">HP {turn.playerHp}/{turn.opponentHp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
