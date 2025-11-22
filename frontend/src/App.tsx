"use client";

import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
import {
  // Home,
  // ShoppingBag,
  // TrendingUp,
  // Sparkles,
  // Settings,
  // LogOut,
  // Wallet,
  ChevronDown,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
// import MagicBento from "@/components/ui/magic-bento";
import { Navbar } from "@/components/layout/navbar";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Mock NFT data - replace with real data later
const mockNFTs = [
  {
    id: 1,
    name: "Cyber Phoenix",
    tier: "Legendary",
    stats: { power: 95, agility: 88, intelligence: 92 },
    image: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500",
    price: "1.2 SUI",
  },
  {
    id: 2,
    name: "Quantum Drake",
    tier: "Enhanced",
    stats: { power: 78, agility: 85, intelligence: 90 },
    image: "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500",
    price: "0.8 SUI",
  },
  {
    id: 3,
    name: "Plasma Serpent",
    tier: "Standard",
    stats: { power: 65, agility: 70, intelligence: 68 },
    image: "bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500",
    price: "0.3 SUI",
  },
  {
    id: 4,
    name: "Void Hydra",
    tier: "Legendary",
    stats: { power: 92, agility: 80, intelligence: 96 },
    image: "bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500",
    price: "1.5 SUI",
  },
  {
    id: 5,
    name: "Thunder Wyvern",
    tier: "Enhanced",
    stats: { power: 88, agility: 92, intelligence: 75 },
    image: "bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500",
    price: "0.9 SUI",
  },
];

// const menuItems = [
//   { icon: Home, label: "Home", active: true },
//   { icon: ShoppingBag, label: "Marketplace", active: false },
//   { icon: TrendingUp, label: "Analytics", active: false },
//   { icon: Sparkles, label: "Evolution", active: false },
// ];

const recentActivity = [
  {
    id: 1,
    name: "Crystal_Art",
    author: "@rudepixel",
    image: "bg-gradient-to-br from-pink-400 to-rose-500",
    bid: "6.25 ETH",
    time: "3m ago",
    type: "New Bid",
  },
  {
    id: 2,
    name: "Creative Art",
    author: "@songkang",
    image: "bg-gradient-to-br from-red-500 to-pink-600",
    bid: "7.50 ETH",
    time: "3m ago",
    type: "New Bid",
  },
];

export default function App() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-slate-200 font-sans selection:bg-primary/20 overflow-hidden relative">
      <Navbar />
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_200_200%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27noiseFilter%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.65%27_numOctaves=%273%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E')] opacity-[0.03] mix-blend-overlay" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Left Sidebar */}
      {/* <aside className="fixed left-4 top-4 bottom-4 w-16 bg-[#0f0f2e]/80 backdrop-blur-xl border border-white/10 z-40 flex flex-col items-center py-6 rounded-3xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-8">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        <nav className="flex-1 flex flex-col items-center justify-center gap-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                item.active
                  ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50"
                  : "bg-[#1a1a3e] text-slate-400 hover:bg-[#252550] hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-3">
          <button className="w-12 h-12 rounded-2xl bg-[#1a1a3e] text-slate-400 hover:bg-[#252550] hover:text-white flex items-center justify-center transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 text-red-400 hover:from-red-500/30 hover:to-pink-500/30 flex items-center justify-center transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside> */}

      {/* Top Bar */}
      {/* <header className="fixed top-0 left-28 right-0 h-20 bg-[#0f0f2e]/80 backdrop-blur-xl border-b border-white/10 z-30 flex items-center justify-between px-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by creator or collection"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Wallet className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">3.25 ETH</span>
          </div>

          <Button className="px-6 py-2 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold border-0 shadow-lg shadow-purple-500/25">
            Create
          </Button>

          <Button className="px-6 py-2 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold border-0">
            Connect Wallet
          </Button>

          <button className="flex items-center gap-3 px-4 py-2 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">MR</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Musfiqur Rahman</div>
              <div className="text-xs text-slate-400">qzerozell@gmail.com</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="pt-20 min-h-screen relative z-10">
        <div className="flex">
          {/* Center Content */}
          <div className="flex-1 p-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                Chimera
              </h1>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Hatch, Discover & Evolve
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl">
                Enter a new dimension of NFT ownership. Acquire mysterious eggs,
                hatch unique creatures, and evolve them into legendary beings.
              </p>
            </motion.div>

            {/* Bento Grid Section */}
            {/* <section className="mb-12">
              <MagicBento
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                clickEffect={true}
                enableMagnetism={true}
                glowColor="132, 0, 255"
              />
            </section> */}

            {/* Featured Creatures Carousel */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <h3 className="text-2xl font-bold text-white">Hot Bids</h3>
                </div>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {mockNFTs.map((nft, index) => (
                    <CarouselItem key={nft.id} className="pl-4 basis-1/3">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="group"
                      >
                        <div className="rounded-2xl overflow-hidden bg-[#0f0f2e]/80 border border-white/10 hover:border-white/20 transition-all">
                          {/* Timer & Likes */}
                          <div className="flex items-center justify-between p-3 bg-black/20">
                            <div className="flex items-center gap-2 text-white text-sm">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="font-mono font-semibold">02:32:07</span>
                            </div>
                            <div className="flex items-center gap-1 text-pink-400">
                              <span className="text-sm font-semibold">239</span>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>

                          {/* NFT Image */}
                          <div className={`aspect-square ${nft.image} relative`}>
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                              <div className="text-white/80 text-6xl font-bold">
                                {nft.name[0]}
                              </div>
                            </div>
                          </div>

                          {/* NFT Info */}
                          <div className="p-4">
                            <h4 className="text-lg font-bold text-white mb-1">{nft.name}</h4>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-[#0f0f2e]" />
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 border-2 border-[#0f0f2e]" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Current Bid</div>
                                <div className="text-lg font-bold text-white">{nft.price}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>
          </div>

          {/* Right Sidebar - Profile */}
          {currentAccount && (
            <aside className="w-96 p-8 bg-[#0f0f2e]/40 backdrop-blur-xl border-l border-white/10">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Profile Card */}
                <div className="rounded-3xl bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] border border-white/10 p-8 mb-6">
                  <h3 className="text-2xl font-bold text-white text-center mb-6">My Profile</h3>
                  
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 p-1">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-4xl">🐉</span>
                        </div>
                      </div>
                      {/* Status Indicators */}
                      <div className="absolute -top-2 -right-2 flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-4 border-[#0f0f2e]" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-[#0f0f2e]" />
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <h4 className="text-xl font-bold text-white text-center mb-6">Musfiqur Rahman</h4>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "Asset", value: "120" },
                      { label: "Followers", value: "10K" },
                      { label: "Likes", value: "70k" },
                      { label: "Bidding", value: "60" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
                      >
                        <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Balance */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-white mb-3">Your Balance</h5>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold">Ξ</span>
                        </div>
                        <span className="text-2xl font-bold text-white">4,668 ETH</span>
                      </div>
                      <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                        <span className="text-sm font-semibold">Add</span>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-white">Revenue</h5>
                      <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                        <span>This Month</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      {/* Simple Bar Chart */}
                      <div className="flex items-end justify-between h-32 gap-2">
                        {[1.0, 1.3, 2.0, 2.1, 1.5, 1.8].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1">
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-cyan-400"
                              style={{ height: `${height * 40}%` }}
                            />
                            <span className="text-xs text-slate-500">
                              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-white">Recent Activity</h5>
                      <button className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                        <span>See All</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <div className={`w-14 h-14 rounded-xl ${activity.image} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-2xl">💎</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h6 className="text-sm font-bold text-white mb-0.5">{activity.name}</h6>
                            <p className="text-xs text-slate-400">by {activity.author}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-cyan-400 font-semibold mb-0.5">{activity.type}</div>
                            <div className="text-sm font-bold text-white">{activity.bid}</div>
                            <div className="text-xs text-slate-500">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
