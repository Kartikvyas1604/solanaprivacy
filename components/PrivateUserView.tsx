"use client";

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Eye, EyeOff, Lock, RefreshCw, Wallet, TrendingUp, History } from 'lucide-react';
import { fetchAndDecryptBalance, formatAddress } from '@/lib/crypto';
import { useArcium } from '@/components/providers/ArciumProvider';
import { motion, AnimatePresence } from 'framer-motion';

export function PrivateUserView() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { isReady } = useArcium();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (publicKey) {
      loadBalance();
    }
  }, [publicKey]);

  const loadBalance = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      // Mock keypair for now
      const mockKeypair = { secret: 'mock' };
      const val = await fetchAndDecryptBalance(connection, publicKey, mockKeypair);
      setBalance(val);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
     return (
        <div className="flex flex-col items-center justify-center p-8 text-neutral-500 bg-neutral-900/10 rounded-lg border border-neutral-800 border-dashed">
            <Lock className="w-8 h-8 mb-2 opacity-50" />
            <p>Connect wallet to view private data</p>
        </div>
     );
  }

  return (
    <div className="space-y-4">
        {/* Balance Card */}
        <div className="bg-[#1C1C1C] p-4 rounded-lg border border-green-500/20 relative overflow-hidden group">
            {/* Subtle Grid Background */}
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="flex items-center gap-2 text-green-400">
                     <Wallet className="w-4 h-4" />
                     <span className="text-xs font-semibold uppercase tracking-wider">Private Vault Balance</span>
                 </div>
                 <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-neutral-500 hover:text-white transition-colors p-1"
                 >
                     {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 </button>
             </div>

             <div className="flex items-end justify-between relative z-10">
                <div className="flex items-baseline gap-1">
                     <AnimatePresence mode="wait">
                       {loading ? (
                         <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-8 w-24 bg-neutral-800 rounded animate-pulse"
                         />
                       ) : showBalance ? (
                         <motion.h3 
                            key="balance"
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-bold text-white font-mono"
                         >
                            {balance?.toLocaleString()} <span className="text-sm font-sans text-neutral-400">USDC</span>
                         </motion.h3>
                       ) : (
                           <motion.h3 
                             key="hidden"
                             initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                             className="text-2xl font-bold text-white font-mono blur-md select-none"
                           >
                              50,000
                           </motion.h3>
                       )}
                     </AnimatePresence>
                </div>
                <button 
                  onClick={loadBalance}
                  disabled={loading}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
             </div>
        </div>

        {/* Private Activity Feed */}
        <div className="bg-[#1C1C1C] rounded-lg border border-green-500/20 overflow-hidden">
             <div className="px-4 py-2 border-b border-green-500/10 flex justify-between items-center bg-green-500/5">
                 <span className="text-green-500/80 text-xs font-medium flex items-center gap-1">
                     <History className="w-3 h-3"/> Decrypted Activity
                 </span>
                 <span className="text-[10px] text-green-500/50">Only visible to keyholder</span>
             </div>
             <div className="divide-y divide-neutral-800">
                 <div className="p-3 flex justify-between items-center group hover:bg-green-500/5 transition-colors">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                             <TrendingUp className="w-4 h-4" />
                         </div>
                         <div>
                             <div className="text-xs text-white font-medium">Trade Executed</div>
                             <div className="text-[10px] text-neutral-500">2 minutes ago</div>
                         </div>
                     </div>
                     <div className="text-right">
                         <div className="text-green-400 text-xs font-mono">+ 2,500 USDC</div>
                         <div className="text-[10px] text-neutral-500">Strategy A</div>
                     </div>
                 </div>
                 
                 <div className="p-3 flex justify-between items-center group hover:bg-green-500/5 transition-colors">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                             <Lock className="w-4 h-4" />
                         </div>
                         <div>
                             <div className="text-xs text-white font-medium">Fee Settlement</div>
                             <div className="text-[10px] text-neutral-500">1 hour ago</div>
                         </div>
                     </div>
                     <div className="text-right">
                         <div className="text-neutral-300 text-xs font-mono">- 34.20 USDC</div>
                         <div className="text-[10px] text-green-500/50">via Arcium MPC</div>
                     </div>
                 </div>
             </div>
        </div>
        
        <div className="text-[10px] text-neutral-500 flex justify-center gap-1">
             <Lock className="w-3 h-3" />
             End-to-end encrypted using ElGamal
        </div>
    </div>
  );
}
