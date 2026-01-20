'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicExplorerView } from '@/components/PublicExplorerView';
import { PrivateUserView } from '@/components/PrivateUserView';
import { SubscribeToTrader } from '@/components/SubscribeToTrader';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, Shield, Zap } from 'lucide-react';

export default function Dashboard() {
  const { publicKey } = useWallet();
  const [viewMode, setViewMode] = useState<'public' | 'private'>('private');
  
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
        {/* Header */}
        <header className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-black" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">SPECTRE</span>
                </div>
                <div className="flex items-center gap-4">
                     <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-200 !h-10 !rounded-lg !font-medium" />
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-8 space-y-12">
            
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                    Zero-Knowledge Asset Management
                </h1>
                <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                    Copy trade whales without leaking alpha. Production-grade privacy powered by Solana Confidential Transfers & Arcium MPC.
                </p>
                
                {publicKey && (
                    <div className="flex justify-center pt-4">
                         <SubscribeToTrader traderId="TRADER_XYZ_123" />
                    </div>
                )}
            </div>

            {/* Dual View Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
                
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-full p-2 text-neutral-500">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                </div>

                {/* LEFT: Public Blockchain View */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl group-hover:bg-red-500/10 transition-all duration-500"></div>
                    <div className="relative border border-red-500/30 rounded-2xl p-6 bg-neutral-900/40 backdrop-blur-sm h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                                🌐 Public View
                            </h2>
                            <span className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                                Visible to Everyone
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-8">
                            This is what bots, competitors, and block explorers see. 
                            Your alpha is exposed, and your PnL is public.
                        </p>
                        
                        <PublicExplorerView address={publicKey?.toString()} />
                        
                        <div className="mt-8 pt-6 border-t border-red-500/20 space-y-3 text-sm font-mono text-neutral-500">
                            <div className="flex justify-between">
                                <span>Balance:</span>
                                <span className="text-red-400/50 bg-red-950/30 px-2 rounded">████████</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Trade:</span>
                                <span className="text-red-400/50 bg-red-950/30 px-2 rounded">████████</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fees Paid:</span>
                                <span className="text-red-400/50 bg-red-950/30 px-2 rounded">████████</span>
                            </div>
                        </div>
                    </div>
                </div>
      
                {/* RIGHT: Private User View */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-green-500/5 rounded-2xl blur-xl group-hover:bg-green-500/10 transition-all duration-500"></div>
                    <div className="relative border border-green-500/30 rounded-2xl p-6 bg-neutral-900/40 backdrop-blur-sm h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                🔐 Your Private View
                            </h2>
                            <span className="text-[10px] uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                                Decrypted locally
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-8">
                            Your data is encrypted on-chain. Only your private key can decrypt balances and verify trade history.
                        </p>
                        
                        <PrivateUserView />
                        
                        <div className="mt-8 pt-6 border-t border-green-500/20 space-y-3 text-sm font-mono text-neutral-300">
                            <div className="flex justify-between items-center group/item hover:bg-green-500/5 px-2 -mx-2 rounded transition-colors">
                                <span className="text-neutral-500">Real Balance:</span>
                                <span className="text-green-400 font-bold">50,000 USDC</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:bg-green-500/5 px-2 -mx-2 rounded transition-colors">
                                <span className="text-neutral-500">Last Trade:</span>
                                <span className="text-green-400">+2,500 USDC</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:bg-green-500/5 px-2 -mx-2 rounded transition-colors">
                                <span className="text-neutral-500">Fees (20%):</span>
                                <span className="text-green-400 flex items-center gap-1">
                                    500 USDC <Zap className="w-3 h-3 text-yellow-500" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                    { title: "Dark Vault", desc: "Balances encrypted with Twisted ElGamal on Token-2022." },
                    { title: "Ghost Settle", desc: "Fees calculated blindly using Arcium MPC Networks." },
                    { title: "Shadow Stream", desc: "Withdraw profits anonymously with ZK Proofs." }
                ].map((f, i) => (
                    <div key={i} className="bg-neutral-900/50 border border-white/5 p-6 rounded-xl hover:border-green-500/30 transition-colors">
                        <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
                        <p className="text-neutral-400 text-sm">{f.desc}</p>
                    </div>
                ))}
            </div>

        </main>
    </div>
  );
}
