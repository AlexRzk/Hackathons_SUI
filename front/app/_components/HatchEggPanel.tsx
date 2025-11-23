'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import clsx from 'clsx';
import { buildHatchEggTx } from '@/src/lib/buildHatchEggTx';

export function HatchEggPanel() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [eggId, setEggId] = useState('');
  const [monsterName, setMonsterName] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [digest, setDigest] = useState<string | null>(null);

  const handleHatch = async () => {
    if (!account) {
      setStatus('error');
      setMessage('Connect a wallet before hatching.');
      return;
    }
    if (!eggId) {
      setStatus('error');
      setMessage('Provide the Egg object ID.');
      return;
    }

    setStatus('pending');
    setMessage('Awaiting wallet signature…');
    setDigest(null);

    try {
      const tx = buildHatchEggTx(eggId, monsterName || 'Unnamed');
      const result = await signAndExecuteTransaction({ transaction: tx });
      const txDigest = 'digest' in result ? result.digest : undefined;

      if (!txDigest) {
        throw new Error('Missing transaction digest.');
      }

      setStatus('success');
      setMessage('Egg hatched! View on Sui Explorer.');
      setDigest(txDigest);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Hatch failed.');
    }
  };

  return (
    <section className="space-y-4 rounded-[32px] border border-white/10 bg-[#0f0c1b]/70 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-[#8b7bff]">Hatch Lab</p>
        <h3 className="text-2xl font-bold">Reveal your monster</h3>
        <p className="text-sm text-white/70">
          Paste an Egg object ID from your wallet inventory, pick a codename, and the contract will mint a randomized monster using the on-chain clock.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-white/80">Egg Object ID</span>
          <input
            type="text"
            value={eggId}
            onChange={(event) => setEggId(event.target.value.trim())}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#330df2] focus:outline-none"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-white/80">Monster Codename</span>
          <input
            type="text"
            value={monsterName}
            onChange={(event) => setMonsterName(event.target.value)}
            placeholder="Nova Wyvern"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#330df2] focus:outline-none"
          />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleHatch}
          className={clsx(
            'rounded-xl px-6 py-3 text-sm font-semibold transition',
            status === 'pending' ? 'bg-white/10 text-white/70' : 'bg-[#330df2] text-white hover:bg-[#4a3bff]',
          )}
          disabled={status === 'pending'}
        >
          {status === 'pending' ? 'Hatching…' : 'Hatch Egg'}
        </button>
        <div className="text-xs text-white/70">
          {status === 'idle' && 'Awaiting input.'}
          {status === 'pending' && message}
          {status === 'error' && <span className="text-rose-300">{message}</span>}
          {status === 'success' && digest && (
            <a
              href={`https://suiexplorer.com/txblock/${digest}?network=testnet`}
              target="_blank"
              rel="noreferrer"
              className="text-[#8b7bff] underline"
            >
              View transaction
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
