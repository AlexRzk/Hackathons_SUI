'use client';

import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';
import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';

interface WalletConnectButtonProps {
  className?: string;
  variant?: 'primary' | 'ghost';
}

export function WalletConnectButton({ className, variant = 'primary' }: WalletConnectButtonProps) {
  const account = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const baseClasses = 'flex min-w-[84px] items-center justify-center gap-2 rounded-lg px-4 font-bold transition-colors h-10';

  const enokiWallet = wallets.find((wallet) => isEnokiWallet(wallet));
  const otherWallets = wallets.filter((wallet) => !isEnokiWallet(wallet));

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        menuRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  if (account) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className={clsx(
          baseClasses,
          'bg-white/10 text-white hover:bg-white/20 border border-white/20',
          className,
        )}
      >
        <span className="material-symbols-outlined text-base">link_off</span>
        <span>
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
      </button>
    );
  }

  const connectWithWallet = (wallet: (typeof wallets)[number]) => {
    connect({ wallet });
    setMenuOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => {
          if (!wallets.length) {
            return;
          }
          setMenuOpen((prev) => !prev);
        }}
        className={clsx(
          baseClasses,
          variant === 'primary'
            ? 'bg-[#330df2] text-white hover:bg-[#4a3bff]'
            : 'border border-white/20 text-white hover:bg-white/10',
          className,
        )}
      >
        <span className="material-symbols-outlined text-base">account_balance_wallet</span>
        <span>Connect Wallet</span>
        <span className="material-symbols-outlined text-sm">expand_more</span>
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Wallet connection options"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-[#1d1b27]/95 p-3 shadow-2xl"
        >
          {enokiWallet && (
            <div className="mb-2 rounded-lg bg-[#330df2]/10 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">zkLogin</p>
              <p className="text-xs text-white/60">Sign in with Google via Enoki</p>
              <button
                type="button"
                onClick={() => connectWithWallet(enokiWallet)}
                className="mt-3 flex w-full items-center justify-between rounded-lg bg-[#330df2] px-3 py-2 text-sm font-semibold hover:bg-[#4a3bff]"
              >
                <span>Continue with Google (zkLogin)</span>
                <span className="material-symbols-outlined text-base">g_translate</span>
              </button>
            </div>
          )}

          {otherWallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/60">Wallet adapters</p>
              {otherWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => connectWithWallet(wallet)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10"
                >
                  <span>{wallet.name}</span>
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              ))}
            </div>
          )}

          {!enokiWallet && otherWallets.length === 0 && (
            <p className="text-sm text-white/60">No wallets detected. Install a wallet extension to continue.</p>
          )}
        </div>
      )}
    </div>
  );
}
