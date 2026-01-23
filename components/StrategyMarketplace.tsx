'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Activity, Star, Clock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useStrategies } from '@/lib/hooks/useStrategies';
import { SpectreSDK } from '@/lib/spectre-sdk';
import { formatNumber, formatPercent, timeAgo } from '@/lib/helpers';

export function StrategyMarketplace() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { strategies, loading, error, refreshStrategies } = useStrategies();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'subscribers' | 'volume' | 'fees'>('subscribers');

  const handleSubscribe = async (strategyId: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    const amountInput = prompt('Enter amount to subscribe (SOL):', '1.0');
    if (!amountInput) return;

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid amount');
      return;
    }

    setSubscribing(strategyId);
    try {
      const sdk = new SpectreSDK(connection, wallet);
      const strategyPubkey = new PublicKey(strategyId);
      
      await sdk.subscribeToStrategy(
        wallet.publicKey,
        strategyPubkey,
        amount
      );
      alert('Successfully subscribed to strategy!');
      refreshStrategies();
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const handleViewDetails = (strategyId: string) => {
    router.push(`/strategies/${strategyId}`);
  };

  // Filter and sort strategies
  const filteredStrategies = strategies
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trader.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'subscribers') return b.totalSubscribers - a.totalSubscribers;
      if (sortBy === 'volume') return b.totalVolumeTraded - a.totalVolumeTraded;
      if (sortBy === 'fees') return b.totalFeesEarned - a.totalFeesEarned;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-400">Loading strategies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md bg-card/50 border-red-500/50">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold">Failed to Load Strategies</h3>
            <p className="text-sm text-neutral-400">{error.message}</p>
            <Button onClick={refreshStrategies} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md bg-card/50">
          <CardContent className="p-8 text-center space-y-4">
            <Activity className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">No Strategies Available</h3>
            <p className="text-sm text-neutral-400">
              Be the first to create a trading strategy!
            </p>
            <Button className="bg-primary text-black">
              Create Strategy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Strategy Marketplace</h2>
          <p className="text-neutral-400 mt-2">
            Discover and subscribe to top performing trading strategies
          </p>
        </div>
        <Button onClick={refreshStrategies} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search strategies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="subscribers">Most Subscribers</option>
          <option value="volume">Highest Volume</option>
          <option value="fees">Top Earners</option>
        </select>
      </div>

      {/* Strategies Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredStrategies.map((strategy) => (
          <Card key={strategy.publicKey} className="bg-card/50 backdrop-blur border-white/10 hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {strategy.name}
                    {strategy.isActive && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    )}
                  </CardTitle>
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    {strategy.trader.slice(0, 4)}...{strategy.trader.slice(-4)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">
                    {((100 - strategy.performanceFeeBps / 100) / 20).toFixed(1)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-300 line-clamp-2">
                {strategy.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-neutral-400 text-xs">
                    <Users className="w-3 h-3" />
                    <span>Subscribers</span>
                  </div>
                  <p className="font-semibold">{strategy.totalSubscribers}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-neutral-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>Volume</span>
                  </div>
                  <p className="font-semibold">{formatNumber(strategy.totalVolumeTraded / 1e9)} SOL</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-neutral-400 text-xs">
                    <DollarSign className="w-3 h-3" />
                    <span>Fees</span>
                  </div>
                  <p className="font-semibold">{formatPercent(strategy.performanceFeeBps / 100)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <Button
                  onClick={() => handleViewDetails(strategy.publicKey)}
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400 hover:text-white"
                >
                  View Details
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  onClick={() => handleSubscribe(strategy.publicKey)}
                  disabled={subscribing === strategy.publicKey || !wallet.connected}
                  size="sm"
                  className="bg-primary text-black hover:bg-primary/90"
                >
                  {subscribing === strategy.publicKey ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
