"use client";

import { useCurrentAccount } from '@mysten/dapp-kit';
import { SiteHeader } from '@/components/SiteHeader';
import { WalletConnectButton } from '@/components/WalletConnectButton';

type Monster = {
  name: string;
  level: number;
  type: string;
  power: number;
  image: string;
  slots: Array<null | { image: string; label: string }>;
};

type EquipmentItem = {
  name: string;
  stat: string;
  image: string;
  category: 'Weapon' | 'Armor' | 'Amulet' | 'All';
  rarity?: string;
  isEquipped?: boolean;
};

const MONSTERS: readonly Monster[] = [
  {
    name: 'Infernodragon',
    level: 15,
    type: 'Fire',
    power: 850,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4d8A3XYXnaXSeyA-ixUxfYZabjeN-qsty4H1hzpoA1lUJP6pF-XYvXLcKIcq7sZGmRPTyc_VCTQSc_b-6zBwJc2HIRRmpMx8TtIlD1sTzbxRJHTtFG4tCynMYAT-G2JQ6Odfd-fUhQoglddZu_PrDvDt6eQxWgFCzQVm2Gzj1FmGZlkD677f50QqZBO12Kq-SIXd5ZsPxPUTc1B4FdwuznSjM3a3hkra0LeLWy4-fwyCxDnX119QmGLgyjRGQhaD7Sdi4c-etkck',
    slots: [
      {
        label: 'Inferno Gauntlet',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCoojzKy_t6STUNZFZ4cBVD5MzBZrAlJeDerVmRMLzB_s1q6ilPYhvC7ta_naDNzm0l4NMpTmQiD4hutty1ucGvbUcJ9Y71LgtypT1OR3nokzZOYRBFOLs76drp7944n97yaRGO0AQQ_0s23NSDtDA4u4icSEy-fWi_0PoS_Um50_1ZaYif4N8SGh8obP6rOjxdCZuWVY1A5xln8v7u9D1aQDeDXpzvJeFbs-X-Vgg7T6IYdoE8k0Z78AB1asYpL2Qc5mARjKwdOiI',
      },
      null,
      null,
    ],
  },
  {
    name: 'Aquarix',
    level: 12,
    type: 'Water',
    power: 720,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCy3h4aeNmubom575rVczmanDIxX9zctMuNZqNj7CSGzBYNbvXuywHJYzZxBL-XQ5BWZ6EbIYql5PaIa6HrLOG36_rrFj_9vquPO1LikmTusSHyP1YVyYsTQdXjOla9zKqQOl0Po8IAjhcJxkV7XgMMC4geQLIzJPeVNAWKecOzcgw8NObBDiujiRzKoe_Tzdmvh2nLg_bIecLmiNssRaL8jFZpU7Av1559qKuH5vzi-1Oas3CIIarL5zdhotnJBSA8oy67Sb1nf8',
    slots: [
      null,
      {
        label: 'Coral Shield',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDh8a1rstnPGgKfxPb2jpijWmR0ncu2HDGJTebrQickQr2E8cGiatpECkt56VHkv1A2He6Eg-6zdlTlQB_EoN2iUQaq5_kkiZOfXKvz4Gd7UQzbmmCk6SBbr08Fi6mUcxA2GDmu6mSBqdayE_797K2hPbex7BdOGanmFCaxTC0B0cJjenlNWEnRrFqWP4HfHjDwSvAwqpBN8c4a7y910HGkbbrCl9h71X9eixJLDc_D5EJlhrGqMiE8mEd70PWQTHIgzWIefycs-W8',
      },
      null,
    ],
  },
  {
    name: 'Gaiadon',
    level: 20,
    type: 'Earth',
    power: 950,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAod-hNY1OzckknvEWz2S2zPEnbQ_7SZ4zIi9aLweBqojrb_0X9EnRzqzB_Hd4ygd6lKaBDM8HA7loWCXP3Ls2vSNyzGdDw7JAW_dMW9Tm8pY5wEOJVxo70Zrp9QBW6OuObFtmhC2k4Ik-8MznHxsQd6-_5yYklaf-VXSb93jEY-Sq8l-w_q2CbqtWqHw5iiuQFF059wpmolRNVMdEkaW8AiovRscOk2oiH1mV_xBhI_2pgadIvVJacU7nIEU2ylos6sz6yZ9tlqr0',
    slots: [null, null, null],
  },
];

const EQUIPMENT: readonly EquipmentItem[] = [
  {
    name: 'Inferno Gauntlet',
    stat: '+20 Attack',
    category: 'Weapon',
    isEquipped: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoojzKy_t6STUNZFZ4cBVD5MzBZrAlJeDerVmRMLzB_s1q6ilPYhvC7ta_naDNzm0l4NMpTmQiD4hutty1ucGvbUcJ9Y71LgtypT1OR3nokzZOYRBFOLs76drp7944n97yaRGO0AQQ_0s23NSDtDA4u4icSEy-fWi_0PoS_Um50_1ZaYif4N8SGh8obP6rOjxdCZuWVY1A5xln8v7u9D1aQDeDXpzvJeFbs-X-Vgg7T6IYdoE8k0Z78AB1asYpL2Qc5mARjKwdOiI',
  },
  {
    name: 'Coral Shield',
    stat: '+15 Defense',
    category: 'Armor',
    isEquipped: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDh8a1rstnPGgKfxPb2jpijWmR0ncu2HDGJTebrQickQr2E8cGiatpECkt56VHkv1A2He6Eg-6zdlTlQB_EoN2iUQaq5_kkiZOfXKvz4Gd7UQzbmmCk6SBbr08Fi6mUcxA2GDmu6mSBqdayE_797K2hPbex7BdOGanmFCaxTC0B0cJjenlNWEnRrFqWP4HfHjDwSvAwqpBN8c4a7y910HGkbbrCl9h71X9eixJLDc_D5EJlhrGqMiE8mEd70PWQTHIgzWIefycs-W8',
  },
  {
    name: 'Void Blade',
    stat: 'Legendary | +50 Attack',
    category: 'Weapon',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAD3NQfLn78w0zuvZMIIRVA81DMYhOZAt8gKiCKFmkn8b7zZS-1Gyk-c979B1mqdBZkKpzmyp43RSWm3cCqb6iAnaeQGKs4J2vP7tla20efopPYc18vB1uVfQi0x543Rajo9IxkqphAYnj1_2HBl0Xx861-G8h74EyCtu-hHnu7Lb3sDhQL_kueFDDqhgkVLbL889D0SxHRQJwFkmqoErrQJockWjMpEM1AvYQdjy1JLaAbTJ8MD4mpIojdLhlR-esGR8IMgQItsdw',
    rarity: 'Legendary',
  },
  {
    name: 'Cosmic Helm',
    stat: '+10 Health',
    category: 'Armor',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqZuqZsxbLu3jv81vhUH7GQrQKMAWWKgnoBN3ISIeUFy8E7Ztpz9btjAfQBdnJsvTl8eD4LBYUpLPNM-pYnen1RYLE9fFSzoyx8uLFltvp0sZ0jLMqmrTUfeFo1aw2_ZUoubxcq4Fzj0JAR6DTReu4QwSHLPYWZqndXKgUWU27nCG2-X4ZIe5EIf8-rk9P2bvSZA0KzyUj6XxgdhnZSIlzpw0qTXUgy34jvJIrfuxRnbO2Dr8zDbqrt9cZVW4-kMkEh5L5WtBBofs',
  },
  {
    name: 'Amulet of Vitality',
    stat: '+5% Crit Chance',
    category: 'Amulet',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQJLcySuVBJQEDu1SnBRqJdqNaf4120Ist08oSg4UgitJ7ff34QEaIGAkjJEN0ubrNZKoBW8Af8jksK9csCQckQAozVcjvu64jwrqqNa7QQK607xbd26HXNZGD5esM5_70uYqqO_A2lwlAVaHis6LNqeHg7Sch8ODrGkeHh5UdMJYmLhS8XuGtlEjbRkQlfYg_wR4tc_fqzzxvfvLkfUzIzy8spb8jxucBXHJxbimqJ-e4cURYLaMkE1KrLUN5pUkoXmKQoUk4o-8',
  },
  {
    name: 'Empty Slot',
    stat: 'Available slot',
    category: 'All',
    image: '',
  },
];

export default function EquipmentPage() {
  const account = useCurrentAccount();

  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        {!account ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
            <div className="max-w-lg space-y-3">
              <p className="text-3xl font-black">Connect to manage your gear</p>
              <p className="text-white/70">
                Link a wallet to access the genetics lab equipment, assign loadouts, and craft new enhancements.
              </p>
            </div>
            <WalletConnectButton className="h-12" />
          </section>
        ) : (
          <>
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
              <div>
                <h1 className="text-4xl font-black leading-tight">Lab Equipment</h1>
                <p className="mt-1 max-w-2xl text-sm text-white/70">
                  Drag equipment from your armory and drop it onto a monster to create unstoppable battle combinations.
                </p>
              </div>
              <button className="h-12 rounded-lg bg-[#00F5D4] px-6 text-sm font-bold text-[#0b0917] transition hover:bg-[#14ffd6]">
                Confirm Changes
              </button>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="flex flex-col rounded-2xl border border-white/10 bg-[#121118]/80">
                <div className="px-6 pb-4 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Creature Containment</h2>
                      <p className="text-sm text-white/60">Assign equipment to the squad you plan to deploy next.</p>
                    </div>
                    <label className="relative block w-full sm:w-72">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Search by name or type..."
                        className="h-11 w-full rounded-lg border border-white/10 bg-[#2b2839] pl-10 pr-3 text-sm placeholder:text-white/40"
                        aria-label="Search monsters"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
                  {MONSTERS.map((monster) => (
                    <MonsterCard key={monster.name} monster={monster} />
                  ))}
                </div>
              </section>

              <section className="flex flex-col rounded-2xl border border-white/10 bg-[#121118]/80">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-4 pt-6">
                  <h2 className="text-2xl font-bold tracking-tight">Equipment Armory</h2>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {['All', 'Weapon', 'Armor', 'Amulet'].map((filter) => (
                      <button
                        key={filter}
                        className={`rounded-full px-3 py-1.5 font-medium ${
                          filter === 'All'
                            ? 'bg-[#8A2BE2]/30 text-[#8A2BE2]'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        type="button"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-4 px-6 pb-6 md:grid-cols-3">
                  {EQUIPMENT.map((item) => (
                    <EquipmentCard key={item.name} item={item} />
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function MonsterCard({ monster }: { monster: Monster }) {
  return (
    <article className="flex gap-4 rounded-xl border border-transparent bg-[#2b2839]/70 p-4 transition hover:border-[#00F5D4]">
      <div
        className="h-32 w-24 flex-shrink-0 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${monster.image})` }}
        aria-label={`${monster.name} portrait`}
      />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-lg font-bold">{monster.name}</p>
          <p className="text-sm text-white/60">
            LVL {monster.level} | {monster.type} Type | Power: {monster.power}
          </p>
        </div>
        <div className="mt-3 flex gap-3">
          {monster.slots.map((slot, index) => (
            <div
              key={`${monster.name}-slot-${index}`}
              className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-black/30"
              aria-label={slot?.label ?? 'Empty equipment slot'}
            >
              {slot && (
                <div
                  className="size-8 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${slot.image})` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function EquipmentCard({ item }: { item: EquipmentItem }) {
  if (!item.image) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-transparent p-4 text-center text-white/40">
        <span className="material-symbols-outlined text-4xl">add</span>
        <p className="text-sm font-semibold">Empty Slot</p>
      </div>
    );
  }

  return (
    <article
      className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 ${
        item.isEquipped ? 'border-[#00F5D4] bg-[#2b2839]' : 'border-transparent bg-[#2b2839]/70'
      }`}
    >
      {item.isEquipped && (
        <span className="absolute right-2 top-2 rounded-full bg-[#00F5D4]/80 px-2 py-0.5 text-xs font-bold text-[#0b0917]">
          Equipped
        </span>
      )}
      <div
        className="aspect-square w-full rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${item.image})` }}
        aria-label={item.name}
      />
      <p className="w-full text-center text-sm font-semibold">{item.name}</p>
      <p className={`w-full text-center text-xs font-bold ${item.isEquipped ? 'text-[#00F5D4]' : 'text-[#8A2BE2]'}`}>
        {item.stat}
      </p>
    </article>
  );
}
