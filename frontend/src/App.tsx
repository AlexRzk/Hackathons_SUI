import { Navbar } from "@/components/layout/navbar"
import { MarketTicker } from "@/components/layout/market-ticker"
import { PodCard } from "@/components/hatchery/pod-card"
import { BioTank } from "@/components/lab/bio-tank"
import { Flag as Flask, Sparkles, Crown } from "lucide-react"
import { useState } from "react"

export default function App() {
  const [tankState, setTankState] = useState<"empty" | "incubating" | "active">("empty")

  const handlePurchasePod = (tier: string) => {
    console.log("[v0] Pod purchased:", tier)
    setTankState("incubating")

    // Simulate AI generation time
    setTimeout(() => {
      setTankState("active")
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarketTicker />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hatchery Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Acquire Genetic Material</h2>
            <p className="text-muted-foreground text-lg">
              Higher tier pods increase probability of rare AI-synthesized lifeforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <PodCard
              tier="standard"
              name="Standard Issue Pod"
              price="10 SUI"
              icon={Flask}
              probabilities={[
                { rarity: "Common", chance: 80 },
                { rarity: "Rare", chance: 19 },
                { rarity: "Legendary", chance: 1 },
              ]}
              onPurchase={() => handlePurchasePod("standard")}
            />

            <PodCard
              tier="enhanced"
              name="Enhanced Splicing Pod"
              price="50 SUI"
              icon={Sparkles}
              probabilities={[
                { rarity: "Common", chance: 50 },
                { rarity: "Rare", chance: 40 },
                { rarity: "Legendary", chance: 10 },
              ]}
              onPurchase={() => handlePurchasePod("enhanced")}
            />

            <PodCard
              tier="progenitor"
              name="Progenitor Pod"
              price="250 SUI"
              icon={Crown}
              probabilities={[
                { rarity: "Common", chance: 10 },
                { rarity: "Rare", chance: 60 },
                { rarity: "Legendary", chance: 30 },
              ]}
              onPurchase={() => handlePurchasePod("progenitor")}
            />
          </div>
        </section>

        {/* Bio-Tank Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Primary Bio-Tank</h2>
          </div>

          <BioTank state={tankState} onReset={() => setTankState("empty")} />
        </section>
      </main>
    </div>
  )
}
