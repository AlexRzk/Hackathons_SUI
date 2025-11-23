"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Cpu, FlaskConical, Activity } from "lucide-react";
import { EnokiAuthButton } from "@/components/features/auth/enoki-auth-button";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "lab", label: "LAB" },
  { id: "genesis", label: "GENESIS" },
  { id: "exchange", label: "EXCHANGE" },
  { id: "operations", label: "OPERATIONS" },
];

const labSubItems = [
  {
    title: "Genes",
    icon: Dna,
    desc: "Analyze and splice genome sequences.",
    stats: "ACTIVE",
    color: "text-int",
  },
  {
    title: "Equipment",
    icon: Cpu,
    desc: "Manage neural interfaces and hardware.",
    stats: "ONLINE",
    color: "text-pow",
  },
  {
    title: "Hatchery",
    icon: FlaskConical,
    desc: "Incubate and hatch new specimens.",
    stats: "STABLE",
    color: "text-agi",
  },
];

export function Navbar() {
  const [activeTab, setActiveTab] = useState("lab");
  const [isLabHovered, setIsLabHovered] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 z-50 backdrop-blur-md border border-white/10 bg-[#0a0a0b]/80 rounded-full shadow-lg shadow-black/50"
      >
        <div className="h-full px-8 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-lg rounded-full"
              />
              <Dna className="w-6 h-6 text-primary relative z-10" />
            </div>
            <span className="text-xl font-black tracking-widest text-white font-mono group-hover:text-glow transition-all duration-300">
              CHIMERA
            </span>
          </div>

          {/* Center: Switchboard */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative h-16 flex items-center"
                onMouseEnter={() => item.id === "lab" && setIsLabHovered(true)}
                onMouseLeave={() => item.id === "lab" && setIsLabHovered(false)}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "text-sm font-bold tracking-widest transition-colors duration-300 px-2 py-1 font-round",
                    activeTab === item.id ? "text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {item.label}
                </button>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-3 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right: Auth */}
          <div>
            <EnokiAuthButton />
          </div>
        </div>
      </motion.nav>

      {/* LAB Mega Menu HUD */}
      <AnimatePresence>
        {isLabHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 right-0 z-40 flex justify-center pointer-events-none"
          >
            <div 
              className="pt-2 pointer-events-auto"
              onMouseEnter={() => setIsLabHovered(true)}
              onMouseLeave={() => setIsLabHovered(false)}
            >
              <div className="w-[500px] glass-panel rounded-2xl p-4 border border-white/10 bg-[#0a0a0b]/90 backdrop-blur-xl shadow-2xl shadow-black/50">
                <div className="grid gap-2">
                  {labSubItems.map((sub, idx) => (
                    <motion.div
                      key={sub.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
                      onClick={() => console.log(`Clicked ${sub.title}`)}
                    >
                      <div className={cn("p-2 rounded-lg bg-black/50 border border-white/10", sub.color)}>
                        <sub.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-slate-200 font-round">{sub.title}</h4>
                          <span className={cn("text-[10px] font-mono tracking-wider", sub.color)}>
                            [{sub.stats}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-round">{sub.desc}</p>
                      </div>
                      
                      {/* Hover Spotlight Effect (Simplified CSS) */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center px-2">
                  <span className="text-[10px] text-slate-600 font-mono">SYSTEM STATUS: NORMAL</span>
                  <Activity className="w-3 h-3 text-agi animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
