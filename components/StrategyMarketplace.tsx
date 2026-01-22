'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Activity, Star, Clock } from 'lucide-react';

interface Strategy {
  publicKey: string;
  trader: string;
  name: string;
  description: string;
  performanceFeeBps: number;
  totalSubscribers: number;
  totalVolumeTraded: number;
  totalFeesEarned: number;
  isActive: boolean;
  createdAt: number;
}

export function StrategyMarketplace() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadStrategies();
  }, [connection]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      // For demo purposes, using mock data
      // In production, fetch from blockchain
      const mockStrategies: Strategy[] = [
        {
          publicKey: 'Strategy1...',
          trader: '7xKXt...4fGH',
          name: 'Momentum Whale Strategy',
          description: 'High-frequency trading strategy focusing on momentum indicators and whale wallet movements. Proven track record with institutional-grade risk management.',
          performanceFeeBps: 2000,
          totalSubscribers: 127,
          totalVolumeTraded: 5_420_000,
          totalFeesEarned: 84_200,
          isActive: true,
          createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        },
        {
          publicKey: 'Strategy2...',
          trader: '9mNQt...8hKL',
          name: 'DeFi Yield Optimizer',
          description: 'Automated yield farming across major Solana DeFi protocols. Dynamic rebalancing based on APY changes and risk assessment.',
          performanceFeeBps: 1500,
          totalSubscribers: 89,
          totalVolumeTraded: 3_200_000,
          totalFeesEarned: 48_000,
          isActive: true,
          createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        },
        {
          publicKey: 'Strategy3...',
          trader: '3pLMn...2jQW',
          name: 'NFT Floor Sweep',
          description: 'Strategic NFT trading focused on blue-chip collections. Leverages floor price analysis and metadata rarity scoring.',
          performanceFeeBps: 2500,
          totalSubscribers: 54,
          totalVolumeTraded: 1_800_000,
          totalFeesEarned: 45_000,
          isActive: true,
          createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        },
        {
          publicKey: 'Strategy4...',
          trader: '5kWXr...9pBN',
          name: 'MEV Arbitrage Bot',
          description: 'Captures arbitrage opportunities across DEXes with sub-second execution. Privacy-first to prevent front-running.',
          performanceFeeBps: 1800,
          totalSubscribers: 203,
          totalVolumeTraded: 8_900_000,
          totalFeesEarned: 156_000,
          isActive: true,
          createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
        },
      ];
      
      setStrategies(mockStrategies);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (strategyKey: string) => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setSubscribing(strategyKey);
    try {
      // In production, integrate with actual smart contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Successfully subscribed to strategy!');
      loadStrategies();
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}K`;
    }
    return `$${num}`;
  };

  const formatFee = (bps: number): string => {
    return `${(bps / 100).toFixed(1)}%`;
  };

  const getDaysAgo = (timestamp: number): string => {
    const days = Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Strategy Marketplace</h2>
          <p className="text-neutral-400 mt-2">
            Discover and subscribe to top-performing trading strategies
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10">
            <Star className="w-4 h-4 mr-2" />
            Top Rated
          </Button>
          <Button variant="outline" className="border-white/10">
            <Activity className="w-4 h-4 mr-2" />
            Most Active
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <Card
            key={strategy.publicKey}
            className="bg-card/50 border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-white mb-2">
                    {strategy.name}
                  </CardTitle>
                  <p className="text-sm text-neutral-400 line-clamp-2">
                    {strategy.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Active</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Clock className="w-4 h-4" />
                <span>Created {getDaysAgo(strategy.createdAt)}</span>
                <span className="mx-2">•</span>
                <span className="font-mono">
                  {strategy.trader.slice(0, 4)}...{strategy.trader.slice(-4)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>Subscribers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {strategy.totalSubscribers}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Volume Traded</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(strategy.totalVolumeTraded)}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Fees Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatNumber(strategy.totalFeesEarned)}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Performance Fee</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatFee(strategy.performanceFeeBps)}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleSubscribe(strategy.publicKey)}
                disabled={subscribing === strategy.publicKey || !wallet.connected}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {subscribing === strategy.publicKey ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe to Strategy'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {strategies.length === 0 && (
        <div className="text-center py-20">
          <Activity className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">
            No strategies available
          </h3>
          <p className="text-neutral-500">
            Check back later for new trading strategies
          </p>
        </div>
      )}
    </div>
  );
}
