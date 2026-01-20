"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, UserPlus, Check } from 'lucide-react';

export function SubscribeToTrader({ traderId }: { traderId: string }) {
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = async () => {
    if (!connected) return;
    
    setLoading(true);
    try {
        // Mock subscription Call
        console.log(`Subscribing to trader ${traderId}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSubscribed(true);
        console.log('Subscribed!');
      
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (subscribed) {
      return (
        <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 rounded-lg cursor-default border border-green-500/20 font-medium"
        >
            <Check className="w-5 h-5" />
            Subscribed
        </button>
      )
  }
  
  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || !connected}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
        ${loading || !connected 
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25'
        }
      `}
    >
      {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Subscribing...
          </>
      ) : (
          <>
            <UserPlus className="w-5 h-5" />
            Subscribe to Strategy
          </>
      )}
    </button>
  );
}
