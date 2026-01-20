"use client";

import { Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { formatAddress } from '@/lib/crypto';

export function PublicExplorerView({ address }: { address?: string }) {
  if (!address) {
      return (
          <div className="space-y-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 animate-pulse">
             <div className="h-6 w-1/3 bg-neutral-800 rounded"></div>
             <div className="space-y-2">
                 <div className="h-10 bg-neutral-800 rounded"></div>
                 <div className="h-10 bg-neutral-800 rounded"></div>
                 <div className="h-10 bg-neutral-800 rounded"></div>
             </div>
          </div>
      )
  }

  return (
    <div className="space-y-4 font-mono text-sm">
        {/* Mocking a Solscan-like interface */}
        <div className="bg-[#1C1C1C] rounded-lg overflow-hidden border border-neutral-800">
            <div className="bg-[#2C2C2C] px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400 text-xs">Account Details</span>
                <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Solana Devnet
                </span>
            </div>
            <div className="p-4 space-y-4">
                
                <div className="space-y-1">
                    <span className="text-neutral-500 text-xs">Address</span>
                    <div className="flex items-center gap-2 text-neutral-300">
                        {formatAddress(address)}
                        <Copy className="w-3 h-3 cursor-pointer hover:text-white" />
                        <ExternalLink className="w-3 h-3 cursor-pointer hover:text-white" />
                    </div>
                </div>

                <div className="space-y-1">
                     <span className="text-neutral-500 text-xs">Token Extensions</span>
                     <div className="flex gap-2 mt-1">
                         <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                             <ShieldAlert className="w-3 h-3" />
                             Confidential Transfer
                         </span>
                     </div>
                </div>

                <div className="h-px bg-neutral-800 my-2"></div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-neutral-500 text-xs">
                        <span>Token Balance (USDC)</span>
                        <span className="text-red-500 flex items-center gap-1">
                            Encrypted <ShieldAlert className="w-3 h-3"/>
                        </span>
                    </div>
                    
                     <div className="p-3 bg-red-500/5 rounded border border-red-500/10 flex justify-between items-center">
                        <span className="text-red-400 blur-sm select-none">??,???.??</span>
                        <span className="text-xs text-red-500/50">Unknown</span>
                    </div>
                </div>

            </div>
        </div>

        <div className="bg-[#1C1C1C] rounded-lg overflow-hidden border border-neutral-800">
             <div className="bg-[#2C2C2C] px-4 py-2 border-b border-neutral-800">
                 <span className="text-neutral-400 text-xs">Recent Transactions</span>
             </div>
             <div className="divide-y divide-neutral-800">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="p-3 flex justify-between items-center text-xs">
                         <span className="text-blue-400">
                             {formatAddress(`Signature${i}xxxxxxxx`)}
                         </span>
                         <span className="text-neutral-500">Encrypted Instruction</span>
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );
}
