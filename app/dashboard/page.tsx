'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicExplorerView } from '@/components/PublicExplorerView';
import { PrivateUserView } from '@/components/PrivateUserView';
import { SubscribeToTrader } from '@/components/SubscribeToTrader';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, Shield, Zap, Lock, Activity, Eye, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { StrategiesView } from '@/components/StrategiesView';
import { GovernanceView } from '@/components/GovernanceView';

export default function Dashboard() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('portfolio');
  
  return (
    <div className="min-h-screen bg-black text-foreground font-sans selection:bg-primary/30 relative">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
            <div className={`absolute top-0 center w-full h-[500px] blur-[120px] rounded-full opacity-20 transform -translate-y-1/2 transition-colors duration-1000 ${
                activeTab === 'portfolio' ? 'bg-primary/5' :
                activeTab === 'strategies' ? 'bg-purple-500/5' :
                'bg-blue-500/5'
            }`}></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full opacity-10"></div>
        </div>

        {/* Navigation Bar */}
        <header className="border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-xl z-50">
            <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('portfolio')}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all duration-500"></div>
                        <div className="w-10 h-10 bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center justify-center relative z-10">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight text-white block leading-none">SPECTRE</span>
                        <span className="text-[10px] text-neutral-500 tracking-[0.2em] font-medium">PROTOCOL</span>
                    </div>
                </div>
                
                <nav className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5">
                    {['Portfolio', 'Strategies', 'Governance'].map((item) => (
                        <button 
                            key={item}
                            onClick={() => setActiveTab(item.toLowerCase())}
                            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === item.toLowerCase() 
                                ? 'bg-white/10 text-white shadow-lg' 
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                     {/* Custom Wrapper for Wallet Button to match theme */}
                     <div className="wallet-button-wrapper">
                        <WalletMultiButton className="!bg-[#0A0A0A] !border !border-white/10 !text-white hover:!bg-white/5 !h-10 !rounded-lg !font-medium !text-sm !px-5 transition-all !shadow-none" />
                     </div>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-16 relative z-10">
            
            {activeTab === 'portfolio' && (
                <>
                {/* Hero Section */}
                <div className="text-center space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        LIVE ON SOLANA DEVNET
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 max-w-4xl mx-auto leading-[1.1]">
                        Zero-Knowledge <br/> Asset Management
                    </h1>
                    
                    <p className="text-neutral-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                        Copy trade whales without leaking alpha. The first platform powered by <span className="text-white font-medium">Confidential Transfers</span> & <span className="text-white font-medium">Arcium MPC</span>.
                    </p>
                    
                    {publicKey && (
                        <div className="flex justify-center pt-4 animate-fade-in">
                            <div className="p-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl">
                                <SubscribeToTrader traderId="TRADER_XYZ_123" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Dual View Interface */}
                <div className="relative animate-in fade-in delay-150 duration-700">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent hidden lg:block"></div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
                        
                        {/* LEFT: Public View */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <Eye className="w-5 h-5 text-red-500"/>
                                    </div>
                                    <span className="text-neutral-200">Public View</span>
                                </h2>
                                <span className="text-xs font-mono text-neutral-500 bg-white/5 px-2 py-1 rounded">
                                    OBSERVER_MODE
                                </span>
                            </div>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                What the blockchain sees. Your identity is visible, but your financial data is completely opaque to the public.
                            </p>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-red-500/20 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
                                <PublicExplorerView address={publicKey?.toString()} />
                            </div>
                        </div>
            
                        {/* RIGHT: Private View */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                        <Lock className="w-5 h-5 text-primary"/>
                                    </div>
                                    <span className="text-white">Private View</span>
                                </h2>
                                <span className="text-xs font-mono text-primary/70 bg-primary/10 border border-primary/20 px-2 py-1 rounded flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                    DECRYPTED
                                </span>
                            </div>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Only accessible by your private key. Decrypt your balances, view trade history, and manage settlements locally.
                            </p>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
                                <PrivateUserView />
                            </div>
                        </div>
                        
                    </div>
                </div>

                {/* Architecture Section */}
                <div className="pt-20 border-t border-white/5 animate-in fade-in delay-300 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { 
                                icon: Disc,
                                color: "text-purple-400",
                                title: "Dark Vault", 
                                desc: "Balances encrypted with Twisted ElGamal on Token-2022. Mathematical privacy guarantee." 
                            },
                            { 
                                icon: Activity,
                                color: "text-blue-400",
                                title: "Ghost Settle", 
                                desc: "Fees calculated blindly using Arcium MPC Networks. Zero data leakage during settlement." 
                            },
                            { 
                                icon: Lock,
                                color: "text-amber-400",
                                title: "Shadow Stream", 
                                desc: "Withdraw profits anonymously with ZK Proofs to break the on-chain link." 
                            }
                        ].map((f, i) => (
                            <Card key={i} className="group hover:border-white/20 transition-all duration-300 bg-white/[0.02]">
                                <CardContent className="p-6 space-y-4">
                                    <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <f.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-white">{f.title}</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                </>
            )}

            {activeTab === 'strategies' && <StrategiesView />}
            {activeTab === 'governance' && <GovernanceView />}

        </main>
    </div>
  );
}
