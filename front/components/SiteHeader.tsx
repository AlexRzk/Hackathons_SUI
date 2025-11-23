"use client";

import Link from 'next/link';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { WalletConnectButton } from './WalletConnectButton';

type NavLink = {
  label: string;
  href: string;
};

type DropdownNavItem = {
  label: string;
  links: readonly NavLink[];
};

type DirectNavItem = {
  label: string;
  href: string;
};

type NavItem = DropdownNavItem | DirectNavItem;

const NAV_ITEMS = [
  {
    label: 'Lab',
    links: [
      { label: 'Genetics', href: '/lab' },
      { label: 'Equipment', href: '/equipment' },
    ],
  },
  {
    label: 'Team',
    href: '/team',
  },
  {
    label: 'Market',
    links: [
      { label: 'Monsters', href: '/marketplace' },
      { label: 'Equipment', href: '/marketplace?view=equipment' },
    ],
  },
  {
    label: 'Equipment',
    href: '/equipment',
  },
  {
    label: 'Leaderboard',
    href: '/leaderboard',
  },
] as const satisfies readonly NavItem[];

const isDropdownItem = (item: NavItem): item is DropdownNavItem => 'links' in item;

interface SiteHeaderProps {
  variant?: 'solid' | 'glass';
  className?: string;
}

export function SiteHeader({ variant = 'glass', className }: SiteHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = (label: string | null) => {
    cancelScheduledClose();
    setOpenDropdown(label);
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  const shellClasses = clsx(
    'mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 transition-colors',
    variant === 'glass'
      ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl'
      : 'border-b border-white/10 bg-[#131022]/90',
  );

  return (
    <header className={clsx('w-full', className)}>
      <div className={shellClasses}>
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="size-8 text-[#330df2]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              Monstro
            </Link>
          </div>
          <nav className="hidden items-center gap-4 md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              if (isDropdownItem(item)) {
                const isOpen = openDropdown === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={scheduleClose}
                    onFocus={() => openMenu(item.label)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        scheduleClose();
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                    >
                      <span>{item.label}</span>
                      <span
                        className={clsx(
                          'material-symbols-outlined text-base transition-transform',
                          isOpen && 'rotate-180',
                        )}
                      >
                        expand_more
                      </span>
                    </button>
                    <div
                      className={clsx(
                        'absolute left-0 top-full mt-2 min-w-[160px] rounded-lg border border-white/10 bg-[#1d1b27]/95 p-2 shadow-xl transition duration-150',
                        isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                      )}
                      onMouseEnter={() => openMenu(item.label)}
                      onMouseLeave={scheduleClose}
                    >
                      {item.links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <WalletConnectButton />
          <button className="flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
