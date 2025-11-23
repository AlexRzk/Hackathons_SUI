import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';

const MARKETPLACE_ITEMS = [
  {
    name: 'Cryohydra',
    id: '#042',
    price: '1.5 SUI',
    stats: { agi: 85, pow: 120, int: 95 },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC0ns_e3JkwkZDYih37QsqXITDgVXvHdQD-wFfZY0MAf2H2s8N19u6Ymh7VjLUIbp8QcH6sEg0MCzHYVUS79n0CrRMEADEFz4YfhSyA6TqOL_al-rbrlioU6kUQll3Ht5hNnzMFoNbQ_D1la_S2YVZ429inPPHqtt8NpeAIdgM-aSXjVKB-7yARyzQCFbj7iH7ND5VL109wJ__3AZYDEYyF-Wh0kzuGNQG_ghQ9oxHMNDZ1euCohHPAjmPiKRt7skQhNg482lFXJHk',
  },
  {
    name: 'Magmabeast',
    id: '#117',
    price: '2.8 SUI',
    stats: { agi: 40, pow: 180, int: 60 },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDoUnS5SCL-oNTjH23wOT0gNZZzAC6b89-o17HXhSO-Rz3d1KLGJ-5rLCjwkF6KTc9GBmdZ-Ewjx45pwsm20o7eWQvqVbk60PKe1ApVqgiWFqKaM3bE1RC0gOpN3Mh9sjEogi6wmwA7Ein7ZEThswrnzhlK95MJLmFNnVykTpCqYZvnrMPeZlYIh5u_FZY1SAF16X3H7gn7p5kBu1hqAGJicOizD7-ygOWWSF0HZQKDi5VrLP0yt-cUSqQlpUTSHbQkb2R2AqTVDPg',
  },
  {
    name: 'Spectreon',
    id: '#089',
    price: '3.2 SUI',
    stats: { agi: 150, pow: 75, int: 140 },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUGLZLJ3jcBNQJZba4SIC6zOONxNT89oWih7h0F-n7aEAEThrkh8T9Eg7b1LR69BuTRrlXhAOwcUVsw2_4gPNvYWc6iev9yBYA8PK5agJYyHJzEq4VofJh7QgpdDngYVKEmVDLzHv0ancm4gJmdNc-8mbEqRFdCXh-YGPdp33O99dkWaUYIWlyyYpuBIVcMbVQSRRCEBpNHWXVUzU0MGv4Nrj-1GeOhu1iqFjwyVbxQJFXOTbWalB7BvVnZNkBlSkHuK8poRCs9bI',
  },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <aside className="w-full flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-72">
          <h3 className="px-2 text-lg font-bold">Filter & Sort</h3>
          <label className="mt-4 block">
            <span className="sr-only">Search</span>
            <div className="flex items-center rounded-lg border border-white/15 bg-[#2b2839]">
              <span className="material-symbols-outlined px-3 text-white/60">search</span>
              <input
                type="text"
                placeholder="Search by name or ID"
                className="h-11 flex-1 rounded-r-lg border-none bg-transparent pr-3 text-sm text-white focus:outline-none"
              />
            </div>
          </label>
          <div className="mt-6 space-y-3">
            {[
              { title: 'Monster Type', description: 'Select element families such as Fire, Water, or Earth.' },
              { title: 'Rarity', description: 'Toggle between Common, Rare, Epic, and Legendary.' },
              { title: 'Stat Ranges', description: 'Adjust AGI, POW, and INT sliders.' },
              { title: 'Sale Type', description: 'Filter Fixed Price or Auction listings.' },
            ].map((filter) => (
              <details
                key={filter.title}
                className="rounded-lg border border-white/10 bg-[#1c1a29]/70 px-3 py-2"
                open={filter.title === 'Rarity'}
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                  <span>{filter.title}</span>
                  <span className="material-symbols-outlined text-base">expand_more</span>
                </summary>
                <p className="pt-2 text-xs text-white/60">{filter.description}</p>
              </details>
            ))}
          </div>
        </aside>
        <section className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-4xl font-black">Marketplace</p>
            <label className="text-sm text-white/70">
              Sort by:
              <select className="ml-2 rounded-lg border border-white/10 bg-[#2b2839] px-3 py-2 text-sm">
                <option>Recently Listed</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Highest Power</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {MARKETPLACE_ITEMS.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a2e] transition-all hover:border-[#330df2]/60 hover:shadow-[0_25px_45px_rgba(51,13,242,0.25)]"
              >
                <div className="relative">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <button className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white/70">
                    <span className="material-symbols-outlined text-xl">favorite</span>
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-lg font-bold">{item.name}</h4>
                    <span className="text-sm text-white/60">{item.id}</span>
                  </div>
                  <div className="flex justify-around rounded-lg border border-white/10 py-2 text-center text-sm">
                    <Stat label="AGI" value={item.stats.agi} />
                    <Stat label="POW" value={item.stats.pow} />
                    <Stat label="INT" value={item.stats.int} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Price</span>
                    <span className="text-lg font-bold">{item.price}</span>
                  </div>
                  <button className="mt-auto h-11 rounded-lg bg-[#330df2] font-bold opacity-0 transition-opacity group-hover:opacity-100">
                    Buy Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="w-full flex-shrink-0 rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 lg:w-80">
          <h3 className="text-xl font-bold">Quick Trade</h3>
          <div className="mt-4 space-y-6">
            <div className="rounded-xl bg-[#2b2839] p-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>You Pay</span>
                <span>Balance: 12.45</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value="1.5"
                  readOnly
                  className="flex-1 bg-transparent text-2xl font-bold outline-none"
                />
                <button className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 text-sm font-bold">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD16RGuxPzrCJBiqFTYdGd7h_2tDo-TATnGf-1g9GvPqFHwQRskjficK9PpmaNLFcXpYGA-6b6gsKNczGltcc_RiaN19aGZjdwY-zNkEfAQ_u33jYeskLt1Fkf_BoBYJkplY9G-VDV3RipCBqHOJwd-cMx4bm1Uwrdpozo5mmkQRRelgaO3IcmLIE2qyy2AFxyvKUEeJIwsHeglz0pWLkvrYzGAMMwJxPducauvDCTbVfkoY2e6N5iu80WPVGcTZ4S91tIBK_lL0JI"
                    alt="SUI token"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span>SUI</span>
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <button className="flex size-8 items-center justify-center rounded-full border-4 border-[#1a1a2e] bg-[#3f3b54] text-white">
                <span className="material-symbols-outlined text-lg">swap_vert</span>
              </button>
            </div>
            <div className="rounded-xl bg-[#2b2839] p-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>You Receive</span>
                <span>Balance: 2,301</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value="45.82"
                  readOnly
                  className="flex-1 bg-transparent text-2xl font-bold outline-none"
                />
                <button className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 text-sm font-bold">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">A</span>
                  <span>AGI</span>
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-white/60">1 SUI ≈ 30.54 AGI</p>
            <button className="h-12 w-full rounded-lg bg-[#330df2] font-bold">Swap Tokens</button>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
