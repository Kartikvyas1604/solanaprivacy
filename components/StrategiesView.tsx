"use client";

import { Activity, TrendingUp, Users, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscribeToTrader } from "@/components/SubscribeToTrader";

const strategies = [
  {
    id: "TRADER_ALPHA_001",
    name: "Alpha Centauri",
    author: "0xWhale...8821",
    apy: "142.5%",
    winRate: "78%",
    followers: 1240,
    risk: "High",
    description: "Aggressive momentum strategy on SOL ecosystems. High volatility, high reward.",
  },
  {
    id: "TRADER_BETA_002",
    name: "Quantum Neutral",
    author: "0xQuant...9912",
    apy: "45.2%",
    winRate: "92%",
    followers: 850,
    risk: "Low",
    description: "Delta-neutral market making with privacy-preserved order flow.",
  },
  {
    id: "TRADER_GAMMA_003",
    name: "Void Walker",
    author: "0xShadow...1120",
    apy: "88.9%",
    winRate: "65%",
    followers: 2100,
    risk: "Medium",
    description: "Event-driven arbitrage using zero-knowledge proofs for position hiding.",
  },
];

export function StrategiesView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Strategy Marketplace
          </h2>
          <p className="text-neutral-400 mt-2">
            Discover and copy top-performing traders without revealing your position size.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="text-xs">Sort by APY</Button>
            <Button variant="outline" className="text-xs">Sort by Risk</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy, i) => (
          <Card key={strategy.id} className="group hover:border-primary/30 transition-all duration-500 bg-white/[0.02] overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <CardHeader className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                   <Activity className="w-5 h-5" />
                </div>
                <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                    strategy.risk === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                    strategy.risk === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                    'border-primary/30 text-primary bg-primary/10'
                }`}>
                    {strategy.risk} Risk
                </div>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{strategy.name}</CardTitle>
              <CardDescription className="text-xs font-mono">{strategy.author}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 relative z-10">
              <p className="text-sm text-neutral-400 leading-relaxed min-h-[3rem]">
                {strategy.description}
              </p>
              
              <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5 bg-black/20 -mx-6 px-6">
                 <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">APY</div>
                    <div className="text-lg font-bold text-green-400 font-mono">{strategy.apy}</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Win Rate</div>
                    <div className="text-lg font-bold text-white font-mono">{strategy.winRate}</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Copiers</div>
                    <div className="text-lg font-bold text-white font-mono flex items-center gap-1">
                        <Users className="w-3 h-3 text-neutral-500" />
                        {strategy.followers}
                    </div>
                 </div>
              </div>

              <div className="pt-2">
                <SubscribeToTrader traderId={strategy.id} />
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-neutral-500">
                    <Shield className="w-3 h-3" />
                    <span>0% Slippage via Dark Pool</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
