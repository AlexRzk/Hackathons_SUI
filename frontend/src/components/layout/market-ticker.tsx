import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TokenData {
  symbol: string
  price: number
  change: number
}

export function MarketTicker() {
  const [tokens] = useState<TokenData[]>([
    { symbol: "INT", price: 1.24, change: 5 },
    { symbol: "POW", price: 0.89, change: -2 },
    { symbol: "AGI", price: 2.1, change: 12 },
    { symbol: "VIT", price: 0.45, change: 3 },
    { symbol: "DEF", price: 1.87, change: -5 },
  ])

  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 100)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const duplicatedTokens = [...tokens, ...tokens, ...tokens]

  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div className="py-2 flex gap-8" style={{ transform: `translateX(-${offset}%)` }}>
        {duplicatedTokens.map((token, index) => (
          <div key={index} className="flex items-center gap-2 whitespace-nowrap px-4">
            <span className="font-mono font-bold text-foreground">{token.symbol}:</span>
            <span className="font-mono text-foreground">${token.price.toFixed(2)}</span>
            <span
              className={`flex items-center gap-1 text-sm font-mono ${token.change >= 0 ? "text-tier-enhanced" : "text-destructive"}`}
            >
              {token.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {token.change >= 0 ? "+" : ""}
              {token.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
