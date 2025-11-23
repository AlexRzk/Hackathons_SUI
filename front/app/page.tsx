import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { EggMintGrid } from '@/app/_components/EggMintGrid';
import { HatchEggPanel } from '@/app/_components/HatchEggPanel';

const FEATURES = [
  {
    icon: 'query_stats',
    title: 'Dynamic Stats',
    description:
      'Monster stats ($AGI, $POW, $INT) are linked to crypto tokens, making every battle economically meaningful.',
  },
  {
    icon: 'swords',
    title: 'Battle System',
    description:
      "Prepare for an upcoming battle simulator where each monster's DNA determines unique combat outcomes.",
  },
  {
    icon: 'toll',
    title: 'Crypto Staking',
    description: 'Stake your holdings to earn boosts, rewards, and early access to limited-edition drops.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Season 0 Access
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Hatch, Discover & Evolve</h1>
            <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg">
              Start your CryptoMonsters journey: purchase rare eggs, uncover mythical companions, and prepare for battles
              that tie strategy with on-chain economics.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-lg bg-[#330df2] px-6 py-3 font-semibold transition hover:bg-[#4a3bff]"
            >
              Explore Market
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:bg-white/10"
            >
              Visit Lab
            </Link>
          </div>
        </section>

        <EggMintGrid />
  <HatchEggPanel />

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0d0b18] via-[#151431] to-[#080511] p-8 shadow-[0_40px_120px_rgba(51,13,242,0.25)]">
          <div className="absolute inset-0 opacity-60">
            <div className="animate-[pulse_4s_ease-in-out_infinite] absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#330df2]/40 blur-3xl" />
            <div className="animate-[pulse_5s_ease-in-out_infinite] absolute bottom-0 right-[-20%] h-72 w-72 rounded-full bg-[#c084fc]/30 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-10">
            <div className="space-y-4 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-[#8b7bff]">Project Pulse</p>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Why CryptoMonsters Exists</h2>
              <p className="mx-auto max-w-3xl text-base text-gray-300">
                We are building a futuristic petri dish where finance, game theory, and generative DNA collide. Each lab-grown
                monster is born from verifiable randomness, on-chain economics, and community-driven narrative.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Genesis</p>
                <h3 className="mt-3 text-xl font-semibold">Origin Protocol</h3>
                <p className="mt-2 text-sm text-white/70">
                  Monsters are minted via zk-enabled rituals. Wallet privacy meets provable ownership, giving players sovereign avatars.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Existence</p>
                <h3 className="mt-3 text-xl font-semibold">Living Economics</h3>
                <p className="mt-2 text-sm text-white/70">
                  Stats are pegged to synthetic tickers ($AGI, $POW, $INT). The metagame flexes with market volatility, rewarding foresight.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Trajectory</p>
                <h3 className="mt-3 text-xl font-semibold">Reactive Worlds</h3>
                <p className="mt-2 text-sm text-white/70">
                  Upcoming battle simulations, staking rituals, and lab experiments keep the experience kinetic and ever-evolving.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 text-center">
            <h3 className="text-3xl font-bold tracking-tight md:text-4xl">A New Breed of NFT Gaming</h3>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-300">
              CryptoMonsters is an NFT-native experience where rarity determines destiny. Each monster carries
              blockchain-backed stats and tokens that fuel battles, staking strategies, and marketplace intrigue.
            </p>
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="text-[#330df2]">
                    <span className="material-symbols-outlined !text-3xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
        </section>

        <footer className="flex flex-col items-center gap-6 border-t border-white/10 pt-10 text-center text-sm text-gray-400">
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="transition-colors hover:text-white" href="#">
              Whitepaper
            </Link>
            <Link className="transition-colors hover:text-white" href="#">
              Terms of Service
            </Link>
            <Link className="transition-colors hover:text-white" href="#">
              Privacy Policy
            </Link>
          </div>
          <p>© {new Date().getFullYear()} CryptoMonsters. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
