import { SiteHeader } from '@/components/SiteHeader';

const MONSTER = {
  name: 'Glimmerfang',
  rarity: 'Legendary',
  element: 'Fire',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqNkL4lJaKN3R5A93xGmXf-X2E-n_DGlzLD0Bex6zTU2xKDvoNanP8TAZgzFIBrqO8lfcO_XS8BjKjS8YzusLtmZEqigYJQxAKkR24V3IfWmsIXBURwWDJniJNEDVp420S3lAFr4fwkX2_OClMasvJGr9s9Q0K9UFem1i0BQKVgrpnDXpmVYZw0zGh1db1pexEo1v0cjHvVtzeRNhwGuB9WTMFlZOj9CLUnwQs1wtXaXsyjAPcmiGIN-r0XNzQPFphId1q4wxUrqI',
  balances: [
    { label: '$AGI', value: '1,250', color: 'text-yellow-400' },
    { label: '$INT', value: '840', color: 'text-blue-400' },
    { label: '$POW', value: '2,315', color: 'text-red-400' },
  ],
  upgrades: [
    {
      title: 'Agility',
      icon: 'wind_power',
      color: 'text-yellow-400',
      background: 'bg-yellow-500/10',
      progress: 42,
      token: '$AGI',
    },
    {
      title: 'Intelligence',
      icon: 'neurology',
      color: 'text-blue-400',
      background: 'bg-blue-500/10',
      progress: 70,
      token: '$INT',
    },
    {
      title: 'Power',
      icon: 'sports_martial_arts',
      color: 'text-red-400',
      background: 'bg-red-500/10',
      progress: 36,
      token: '$POW',
    },
  ],
};

interface MonsterDetailsPageProps {
  params: {
    monsterId: string;
  };
}

export default function MonsterDetailsPage({ params }: MonsterDetailsPageProps) {
  const displayId = params.monsterId || '7821';

  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <nav className="mb-6 flex items-center gap-2 text-sm text-white/60">
          <span>My Collection</span>
          <span>/</span>
          <span className="text-white">{MONSTER.name} #{displayId}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="aspect-[4/5] bg-cover bg-center" style={{ backgroundImage: `url(${MONSTER.image})` }} />
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {MONSTER.name} #{displayId}
                </h1>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
                    {MONSTER.rarity}
                  </span>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-300">
                    {MONSTER.element}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="h-11 rounded-lg bg-[#330df2] font-bold shadow-lg shadow-[#330df2]/30">
                  List for Sale
                </button>
                <button className="h-11 rounded-lg border border-white/15 bg-white/5 font-bold">
                  Go to Battle
                </button>
              </div>
            </div>
          </section>
          <section className="space-y-6">
            <div>
              <div className="flex gap-6 border-b border-white/10">
                <button className="border-b-2 border-white pb-3 text-sm font-bold">Stats</button>
                <button className="border-b-2 border-transparent pb-3 text-sm font-bold text-white/60">
                  Battle History
                </button>
                <button className="border-b-2 border-transparent pb-3 text-sm font-bold text-white/60">
                  Marketplace
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-bold text-white/70">Your Balances</h3>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {MONSTER.balances.map((balance) => (
                  <div key={balance.label}>
                    <p className={`text-xs font-semibold ${balance.color}`}>{balance.label}</p>
                    <p className="text-xl font-bold">{balance.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {MONSTER.upgrades.map((upgrade) => (
              <div key={upgrade.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex size-12 items-center justify-center rounded-lg ${upgrade.background} ${upgrade.color}`}>
                    <span className="material-symbols-outlined text-2xl">{upgrade.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{upgrade.title}</h4>
                    <p className="text-sm text-white/60">Current progress: {upgrade.progress}%</p>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[#330df2]" style={{ width: `${upgrade.progress}%` }} />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="0"
                      className="h-11 w-full rounded-lg border border-white/15 bg-black/20 pl-12 pr-3 text-white"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/70">
                      {upgrade.token}
                    </span>
                  </div>
                  <button className="h-11 rounded-lg bg-gradient-to-r from-[#330df2] to-[#7b5dff] px-6 text-sm font-bold">
                    Upgrade {upgrade.title}
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
