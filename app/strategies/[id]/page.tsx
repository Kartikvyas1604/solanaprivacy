'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Calendar,
  Shield,
  Loader2,
  Check
} from 'lucide-react';
import { SpectreSDK } from '@/lib/spectre-sdk';
import { formatSOL, formatFeeBps, shortenAddress } from '@/lib/helpers';

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    loadStrategy();
  }, [params.id, wallet.publicKey]);

  const loadStrategy = async () => {
    try {
      const sdk = new SpectreSDK(connection, wallet);
      const strategies = await sdk.getAllStrategies();
      
      const found = strategies.find(
        s => s.publicKey.toBase58() === params.id
      );
      
      if (found) {
        setStrategy(found);
        
        // Check if user is already subscribed
        if (wallet.publicKey) {
          const positions = await sdk.getUserPositions(wallet.publicKey);
          const subscribed = positions.some(
            p => p.strategy.equals(found.publicKey) && p.isActive
          );
          setIsSubscribed(subscribed);
        }
      }
    } catch (error) {
      console.error('Failed to load strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet');
      return;
    }

    const amountInput = prompt('Enter amount to subscribe (SOL):', '1.0');
    if (!amountInput) return;

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid amount');
      return;
    }

    setSubscribing(true);
    try {
      const sdk = new SpectreSDK(connection, wallet);
      
      await sdk.subscribeToStrategy(
        wallet.publicKey,
        strategy.publicKey,
        amount
      );

      alert('Successfully subscribed to strategy!');
      setIsSubscribed(true);
      await loadStrategy();
    } catch (error: any) {
      console.error('Subscription failed:', error);
      
      let errorMsg = 'Failed to subscribe to strategy. ';
      
      if (error.message?.includes('already subscribed')) {
        errorMsg = 'You are already subscribed to this strategy. Check your portfolio to manage your existing position.';
      } else if (error.message?.includes('insufficient')) {
        errorMsg = 'Insufficient balance. Please ensure you have enough SOL in your wallet.';
      } else if (error.message?.includes('StrategyInactive')) {
        errorMsg = 'This strategy is currently inactive and not accepting new subscribers.';
      } else if (error.message?.includes('InsufficientDeposit')) {
        errorMsg = 'Minimum deposit is 1 SOL. Please increase your deposit amount.';
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg += 'Please try again.';
      }
      
      alert(errorMsg);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center">
        <Card className="bg-card/50 border-white/10 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-neutral-400 mb-4">Strategy not found</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysSinceCreated = Math.floor(
    (Date.now() - strategy.createdAt.toNumber() * 1000) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-black text-foreground">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full opacity-10"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-white/10"></div>
            <h1 className="text-xl font-bold text-white">Strategy Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="space-y-6">
          {/* Strategy Header */}
          <Card className="bg-card/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {strategy.name}
                  </h1>
                  <p className="text-neutral-400 mb-4">
                    {strategy.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Shield className="w-4 h-4" />
                      <span>By {shortenAddress(strategy.trader)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Calendar className="w-4 h-4" />
                      <span>Created {daysSinceCreated} days ago</span>
                    </div>
                  </div>
                </div>

                {isSubscribed ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Subscribed</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing || !wallet.publicKey}
                    className="bg-primary text-black hover:bg-primary/90"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>Subscribers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {strategy.totalSubscribers}
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Volume Traded</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatSOL(strategy.totalVolumeTraded.toNumber())} SOL
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Fees Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    {formatSOL(strategy.totalFeesEarned.toNumber())} SOL
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                    <Percent className="w-4 h-4" />
                    <span>Performance Fee</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatFeeBps(strategy.performanceFeeBps)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-white">Strategy Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    strategy.isActive
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {strategy.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Strategy Address</span>
                  <span className="text-white font-mono text-sm">
                    {shortenAddress(strategy.publicKey)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Trader Address</span>
                  <span className="text-white font-mono text-sm">
                    {shortenAddress(strategy.trader)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Created At</span>
                  <span className="text-white">
                    {new Date(strategy.createdAt.toNumber() * 1000).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-white">Fee Structure</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-neutral-400 text-sm mb-2">Performance Fee</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatFeeBps(strategy.performanceFeeBps)}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Charged on profitable trades
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm text-neutral-400 mb-2">
                    💡 Performance fees are only charged when the strategy generates profit
                    for subscribers. Fees are settled weekly and distributed to the trader.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="bg-card/50 border-white/10">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Subscribe</h3>
                  <p className="text-sm text-neutral-400">
                    Deposit SOL to start following this strategy
                  </p>
                </div>
                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Auto-Trade</h3>
                  <p className="text-sm text-neutral-400">
                    Trades are automatically executed based on the strategy
                  </p>
                </div>
                <div className="p-4 bg-black/50 border border-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Earn & Settle</h3>
                  <p className="text-sm text-neutral-400">
                    Monitor performance and settle fees weekly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
