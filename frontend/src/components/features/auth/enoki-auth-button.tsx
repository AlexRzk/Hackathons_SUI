"use client";

import { motion } from "framer-motion";
import { User, LogOut } from "lucide-react";
import { useCurrentAccount, useDisconnectWallet, ConnectModal } from "@mysten/dapp-kit";
import { useState } from "react";

export function EnokiAuthButton() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);

  if (currentAccount) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-agi to-primary rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500" />
        <button
          onClick={() => disconnect()}
          className="relative flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg overflow-hidden"
        >
          {/* Bio-ID Badge */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-int p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-agi rounded-full border-2 border-black animate-pulse" />
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono leading-none mb-1">
              Bio-ID Verified
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </span>
          </div>

          <div className="ml-2 pl-2 border-l border-white/10">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-pow transition-colors" />
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <ConnectModal
      trigger={
        <motion.button
          whileHover="hover"
          initial="initial"
          whileTap={{ scale: 0.96, y: 3.2 }}
          className="relative flex items-center justify-center gap-2 h-10 px-4 border-none rounded-full text-white font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_20px_30px_-7px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer hover:shadow-none hover:translate-y-[2.2px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" fill="white">
            <path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" />
          </svg>
          
          <motion.span
            variants={{
              initial: { width: 0, opacity: 0, display: "none" },
              hover: { width: "auto", opacity: 1, display: "block" }
            }}
            className="whitespace-nowrap overflow-hidden"
          >
            Connect Wallet
          </motion.span>
        </motion.button>
      }
      open={open}
      onOpenChange={setOpen}
    />
  );
}
