'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

interface Position {
  strategyName: string;
  strategyKey: string;
  initialBalance: number;
  currentBalance: number;
  totalFeesPaid: number;
  subscribedAt: number;
  lastFeeSettlement: number;
  isActive: boolean;
}

export function PortfolioTracker() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.publicKey) {
      loadPositions();
    }
  }, [wallet.publicKey]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockPositions: Position[] = [
        {
          strategyName: 'Momentum Whale Strategy',
          strategyKey: 'Strategy1...',
          initialBalance: 10_000_000_000, // 10 SOL
          currentBalance: 12_500_000_000, // 12.5 SOL
          totalFeesPaid: 500_000_000, // 0.5 SOL
          subscribedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          lastFeeSettlement: Date.now() - 7 * 24 * 60 * 60 * 1000,
          isActive: true,
        },
        {
          strategyName: 'DeFi Yield Optimizer',
          strategyKey: 'Strategy2...',
          initialBalance: 5_000_000_000, // 5 SOL
          currentBalance: 5_800_000_000, // 5.8 SOL
          totalFeesPaid: 160_000_000, // 0.16 SOL
          subscribedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
          lastFeeSettlement: Date.now() - 3 * 24 * 60 * 60 * 1000,
          isActive: true,
        },
      ];
      
      setPositions(mockPositions);
    } catch (error) {
      console.error('Failed to load positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleFees = async (strategyKey: string) => {
    setSettling(strategyKey);
    try {
      // In production, call smart contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Fees settled successfully!');
      loadPositions();
    } catch (error) {
      console.error('Fee settlement failed:', error);
      alert('Failed to settle fees. Please try again.');
    } finally {
      setSettling(null);
    }
  };

  const handleUnsubscribe = async (strategyKey: string) => {
    if (!confirm('Are you sure you want to unsubscribe? This will withdraw all your funds.')) {
      return;
    }

    try {
      // In production, call smart contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Successfully unsubscribed and withdrawn funds!');
      loadPositions();
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      alert('Failed to unsubscribe. Please try again.');
    }
  };

  const calculatePnL = (position: Position) => {
    const pnl = position.currentBalance - position.initialBalance;
    const pnlPercentage = (pnl / position.initialBalance) * 100;
    return { pnl, pnlPercentage };
  };

  const formatSOL = (lamports: number): string => {
    return (lamports / 1_000_000_000).toFixed(2);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysAgo = (timestamp: number): number => {
    return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
  };

  const totalValue = positions.reduce((sum, p) => sum + p.currentBalance, 0);
  const totalInvested = positions.reduce((sum, p) => sum + p.initialBalance, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const totalFees = positions.reduce((sum, p) => sum + p.totalFeesPaid, 0);

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-neutral-500">
            Connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Portfolio</h2>
        <p className="text-neutral-400 mt-2">
          Track your active positions and performance
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Total Value</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatSOL(totalValue)} SOL
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>Total P&L</span>
            </div>
            <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatSOL(totalPnL)} SOL
            </p>
            <p className={`text-sm mt-1 ${totalPnL >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
              <Percent className="w-4 h-4" />
              <span>Fees Paid</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatSOL(totalFees)} SOL
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              <span>Active Positions</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {positions.filter(p => p.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Active Positions</h3>
        
        {positions.map((position) => {
          const { pnl, pnlPercentage } = calculatePnL(position);
          const isProfitable = pnl >= 0;

          return (
            <Card
              key={position.strategyKey}
              className="bg-card/50 border-white/10 hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white">
                      {position.strategyName}
                    </CardTitle>
                    <p className="text-sm text-neutral-400 mt-1">
                      Subscribed {getDaysAgo(position.subscribedAt)} days ago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isProfitable ? (
                      <ArrowUpRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfitable ? '+' : ''}{pnlPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Initial</p>
                    <p className="text-lg font-semibold text-white">
                      {formatSOL(position.initialBalance)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Current</p>
                    <p className="text-lg font-semibold text-white">
                      {formatSOL(position.currentBalance)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">P&L</p>
                    <p className={`text-lg font-semibold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfitable ? '+' : ''}{formatSOL(pnl)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Fees Paid</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatSOL(position.totalFeesPaid)} SOL
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Clock className="w-4 h-4" />
                  <span>Last fee settlement: {getDaysAgo(position.lastFeeSettlement)} days ago</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSettleFees(position.strategyKey)}
                    disabled={settling === position.strategyKey || !isProfitable}
                    variant="outline"
                    className="flex-1 border-white/10"
                  >
                    {settling === position.strategyKey ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Settling...
                      </>
                    ) : (
                      'Settle Fees'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUnsubscribe(position.strategyKey)}
                    variant="outline"
                    className="flex-1 border-white/10 hover:border-red-500/30 hover:text-red-400"
                  >
                    Unsubscribe & Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {positions.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
            <Calendar className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-400 mb-2">
              No Active Positions
            </h3>
            <p className="text-neutral-500 mb-6">
              Subscribe to a strategy to start trading
            </p>
            <Button onClick={() => window.location.hash = '#strategies'}>
              Browse Strategies
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
