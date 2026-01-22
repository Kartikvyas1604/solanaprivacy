'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Zap, Lock, Activity, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full opacity-20"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-black/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-card border border-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">SPECTRE</span>
              <span className="text-[10px] text-neutral-500 tracking-[0.2em] font-medium">PROTOCOL</span>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="bg-primary text-black hover:bg-primary/90">
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              LIVE ON SOLANA DEVNET
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-neutral-600 bg-clip-text text-transparent max-w-5xl mx-auto">
              Zero-Knowledge Asset Management
            </h1>
            
            <p className="text-neutral-400 max-w-2xl mx-auto text-xl md:text-2xl leading-relaxed">
              Copy trade whales without leaking alpha. Built with <span className="text-white font-medium">Confidential Transfers</span> & <span className="text-white font-medium">Arcium MPC</span>.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary text-black hover:bg-primary/90 text-lg px-8 py-6">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-lg px-8 py-6">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            <Card className="bg-card/50 backdrop-blur border-white/10 p-8 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Private by Default</h3>
              <p className="text-neutral-400 leading-relaxed">
                All positions and trades are confidential. Only you know your balances.
              </p>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-white/10 p-8 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Copy Best Traders</h3>
              <p className="text-neutral-400 leading-relaxed">
                Subscribe to proven strategies. Automated execution with full privacy.
              </p>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-white/10 p-8 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Performance</h3>
              <p className="text-neutral-400 leading-relaxed">
                Real metrics. Real returns. Zero manipulation. Built on Solana.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-32">
        <div className="max-w-7xl mx-auto px-6 text-center text-neutral-500 text-sm">
          <p>© 2026 Spectre Protocol. Built with ❤️ on Solana.</p>
        </div>
      </footer>
    </div>
  );
}
