import { SiteHeader } from '@/components/SiteHeader';

const LISTING = {
  name: 'Ignis Draco',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAO_FGhVqapGWRKhaKS6LsiTeznXS55aL78npjyxHD8NXo0_EWo-Jzxudoz7lhfHP2xCP3xZVli6EcQy-M2CJO9FCQ3pHmVQdZIyoZ4xBmsmkLxWeQsyuOtR3EgMF8pp70H2xF1o-WEgIGeoKqEAYYK0ykHswcrdNYo8R5ZPpKMqESIT6jiK00Z34cGS8EP07pkwWbgAdIDHleQcRHtkf6k_TjP-oIhVgI_3uDkr0VfG0mrjtPwQShG_i4xXXd90aSB4MNeLJOVGbk',
  tags: ['Genesis Monsters', 'Legendary'],
  price: '2.5 ETH',
  priceUsd: '$7,500.45 USD',
  owner: 'CryptoKing123',
  stats: [
    { label: 'HP', value: 850 },
    { label: 'Attack', value: 920 },
    { label: 'Defense', value: 780 },
    { label: 'Speed', value: 880 },
  ],
  abilities: [
    {
      icon: 'local_fire_department',
      title: 'Inferno Blast',
      description: 'Unleashes a powerful blast of fire, dealing heavy damage.',
    },
    {
      icon: 'shield',
      title: 'Draconic Scales',
      description: 'Hardened scales significantly increase defense for 3 turns.',
    },
  ],
};

interface ListingPageProps {
  params: {
    listingId: string;
  };
}

export default function ListingDetailsPage({ params }: ListingPageProps) {
  const displayId = params.listingId || '1234';

  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/15">
              <div
                className="min-h-[420px] bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4), transparent), url(${LISTING.image})` }}
              >
                <div className="flex h-full items-end p-6">
                  <h1 className="text-4xl font-bold">{LISTING.name} #{displayId}</h1>
                </div>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {LISTING.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#330df2]/20 px-4 py-1 text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </section>
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/70">Current Price</p>
              <p className="text-4xl font-bold">{LISTING.price}</p>
              <p className="text-lg text-white/70">{LISTING.priceUsd}</p>
              <button className="mt-6 h-12 w-full rounded-lg bg-[#330df2] text-lg font-bold">
                Buy Now for {LISTING.price}
              </button>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-12 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0kB66EORQRSKeqTLTFelkhzFa4xOoR32WacEYXqjsAL-HhCmFT88bGtv8rM18ZswGH0xm8FQVyhLz_oNLsoCxBOfLLKvh57PPvqh5xVLQRVXxQzmgy1f0gaQWaSi7asjL-h0padER-x-sSHY_4gEtvm3G-bjVJs113YvEBZSZfIC7E8An36NpaMn5p_owTOPfVu0TdqeWk_nbo0m0evLqEkGnoW4_1VKcK6BtzWcqdsBE6LKkWeQ-5loEDoCCVrdPbXBk73GaOxM')",
                    }}
                  />
                  <div>
                    <p className="text-sm text-white/60">Owned by</p>
                    <p className="font-semibold">{LISTING.owner}</p>
                  </div>
                </div>
                <button className="size-10 rounded-lg text-white hover:bg-white/10">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="flex border-b border-white/10 text-sm font-bold">
                <button className="flex-1 border-b-2 border-white py-3">Stats & Abilities</button>
                <button className="flex-1 border-b-2 border-transparent py-3 text-white/60">
                  Transaction History
                </button>
                <button className="flex-1 border-b-2 border-transparent py-3 text-white/60">Details</button>
              </div>
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4">
                  {LISTING.stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-[#1d1b27] p-4">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>{stat.label}</span>
                        <span className="font-bold text-white">{stat.value}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-[#330df2]" style={{ width: `${stat.value / 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {LISTING.abilities.map((ability) => (
                    <div key={ability.title} className="flex items-center gap-4 rounded-lg bg-[#1d1b27] p-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#330df2]/20 text-[#330df2]">
                        <span className="material-symbols-outlined text-2xl">{ability.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{ability.title}</p>
                        <p className="text-sm text-white/70">{ability.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
