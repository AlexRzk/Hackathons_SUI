import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Probability {
  rarity: string
  chance: number
}

interface PodCardProps {
  tier: "standard" | "enhanced" | "progenitor"
  name: string
  price: string
  icon: LucideIcon
  probabilities: Probability[]
  onPurchase: () => void
}

export function PodCard({ tier, name, price, icon: Icon, probabilities, onPurchase }: PodCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group",
        tier === "standard" && "border-tier-standard hover:border-tier-standard/80 hover:shadow-tier-standard/20",
        tier === "enhanced" && "border-tier-enhanced hover:border-tier-enhanced/80 hover:shadow-tier-enhanced/20",
        tier === "progenitor" && "border-tier-legendary hover:border-tier-legendary/80 hover:shadow-tier-legendary/20",
      )}
    >
      {/* Glow effect on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300",
          tier === "standard" && "bg-gradient-to-br from-tier-standard to-transparent",
          tier === "enhanced" && "bg-gradient-to-br from-tier-enhanced to-transparent",
          tier === "progenitor" &&
            "bg-gradient-to-br from-tier-legendary via-tier-legendary/50 to-transparent animate-pulse",
        )}
      />

      <div className="relative p-6 space-y-4">
        {/* Icon & Title */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "p-3 rounded-lg",
              tier === "standard" && "bg-tier-standard/10",
              tier === "enhanced" && "bg-tier-enhanced/10",
              tier === "progenitor" && "bg-tier-legendary/10",
            )}
          >
            <Icon
              className={cn(
                "w-8 h-8",
                tier === "standard" && "text-tier-standard",
                tier === "enhanced" && "text-tier-enhanced",
                tier === "progenitor" && "text-tier-legendary",
              )}
            />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-mono font-bold",
              tier === "standard" && "border-tier-standard text-tier-standard",
              tier === "enhanced" && "border-tier-enhanced text-tier-enhanced",
              tier === "progenitor" && "border-tier-legendary text-tier-legendary",
            )}
          >
            {price}
          </Badge>
        </div>

        <div>
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
        </div>

        {/* Probability Data */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Drop Rates</p>
          {probabilities.map((prob) => (
            <div key={prob.rarity} className="flex items-center justify-between text-sm">
              <span
                className={cn(
                  "font-medium",
                  prob.rarity === "Legendary" && "text-tier-legendary font-bold",
                  prob.rarity === "Rare" && "text-tier-enhanced",
                  prob.rarity === "Common" && "text-muted-foreground",
                )}
              >
                {prob.rarity}
              </span>
              <span className="font-mono text-foreground">{prob.chance}%</span>
            </div>
          ))}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={onPurchase}
          className={cn(
            "w-full font-bold transition-all",
            tier === "standard" && "bg-tier-standard hover:bg-tier-standard/80 text-background",
            tier === "enhanced" && "bg-tier-enhanced hover:bg-tier-enhanced/80 text-background",
            tier === "progenitor" && "bg-tier-legendary hover:bg-tier-legendary/80 text-background",
          )}
        >
          Initiate Incubation
        </Button>
      </div>
    </Card>
  )
}
