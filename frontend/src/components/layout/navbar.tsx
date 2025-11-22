import { ConnectButton } from "@mysten/dapp-kit"
import { Dna } from "lucide-react"

export function Navbar() {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Dna className="w-6 h-6 text-tier-legendary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">CHIMERA</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover:text-tier-enhanced transition-colors">
              Lab
            </a>
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Hatchery
            </a>
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Market
            </a>
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </a>
          </div>

          {/* Wallet Connect */}
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
