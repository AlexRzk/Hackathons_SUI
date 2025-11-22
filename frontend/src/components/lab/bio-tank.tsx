import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Zap, Brain, Shield } from "lucide-react"
import { useState, useEffect } from "react"

interface BioTankProps {
  state: "empty" | "incubating" | "active"
  onReset: () => void
}

export function BioTank({ state, onReset }: BioTankProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (state === "incubating") {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 3.33
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [state])

  if (state === "empty") {
    return (
      <Card className="max-w-3xl mx-auto border-2 border-dashed border-border bg-card/50">
        <div className="p-12 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-muted-foreground">No Active Specimen Detected</h3>
          <p className="text-muted-foreground">Visit the Hatchery to acquire genetic material and begin synthesis</p>
          <Button variant="outline" className="mt-4 bg-transparent">
            Browse Hatchery
          </Button>
        </div>
      </Card>
    )
  }

  if (state === "incubating") {
    return (
      <Card className="max-w-3xl mx-auto border-2 border-tier-enhanced bg-card shadow-2xl shadow-tier-enhanced/20">
        <div className="p-12 space-y-6">
          {/* Incubation Animation */}
          <div className="relative w-full h-64 bg-gradient-to-b from-tier-enhanced/20 via-tier-enhanced/10 to-transparent rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-tier-enhanced/30 animate-pulse" />
              <div className="absolute w-48 h-48 rounded-full bg-tier-enhanced/20 animate-ping" />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-tier-enhanced">AI Synthesizing Unique Genetic Code...</p>
              <span className="font-mono text-tier-enhanced">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Do not close terminal - Estimated time: 30s
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Active state
  return (
    <Card className="max-w-3xl mx-auto border-2 border-tier-legendary bg-card shadow-2xl shadow-tier-legendary/20">
      <div className="p-8 space-y-6">
        {/* Creature Display */}
        <div className="relative w-full h-64 bg-gradient-to-b from-tier-legendary/20 via-tier-legendary/10 to-transparent rounded-lg overflow-hidden flex items-center justify-center">
          <img src="/futuristic-alien-creature-with-purple-glow.jpg" alt="Chimera Specimen" className="w-full h-full object-contain" />
        </div>

        {/* Creature Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-foreground">Subject X-79</h3>
            <Badge className="bg-tier-legendary text-background font-bold animate-pulse">LEGENDARY</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-tier-enhanced" />
                  <span className="font-medium text-foreground">Intelligence</span>
                </div>
                <span className="font-mono text-muted-foreground">87/100</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-tier-standard" />
                  <span className="font-medium text-foreground">Power</span>
                </div>
                <span className="font-mono text-muted-foreground">62/100</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-tier-legendary" />
                  <span className="font-medium text-foreground">Agility</span>
                </div>
                <span className="font-mono text-muted-foreground">94/100</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button className="bg-tier-enhanced hover:bg-tier-enhanced/80 text-background font-bold">
              Feed (Costs INT)
            </Button>
            <Button className="bg-tier-standard hover:bg-tier-standard/80 text-background font-bold">
              Train (Costs POW)
            </Button>
          </div>

          {/* Reset button for demo */}
          <Button onClick={onReset} variant="outline" className="w-full bg-transparent">
            Reset Demo
          </Button>
        </div>
      </div>
    </Card>
  )
}
