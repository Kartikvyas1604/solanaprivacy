"use client";

import { CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const proposals = [
  {
    id: "SIP-12",
    title: "Increase Performance Fee Cap to 25%",
    status: "Active",
    votesFor: "65%",
    votesAgainst: "35%",
    timeLeft: "2 days",
    description: "Proposal to increase the maximum allowable performance fee for strategies from 20% to 25% to attract premium institutional traders.",
  },
  {
    id: "SIP-11",
    title: "Integrate Arbitrum Cross-Chain Bridge",
    status: "Passed",
    votesFor: "92%",
    votesAgainst: "8%",
    timeLeft: "Ended",
    description: "Launch a trustless bridge to allow seamless USDC deposits from Arbitrum One.",
  },
];

export function GovernanceView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            DAO Governance
          </h2>
          <p className="text-neutral-400 mt-2">
            Vote on protocol parameters using your SPEC tokens. Privacy-preserved voting enabled.
          </p>
        </div>
        <Button variant="outline">New Proposal</Button>
      </div>

      <div className="space-y-4">
        {proposals.map((prop) => (
          <Card key={prop.id} className="group hover:border-white/20 transition-all duration-300 bg-white/[0.02]">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded">{prop.id}</span>
                        {prop.status === 'Active' ? (
                            <span className="text-xs font-medium text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                <CheckCircle2 className="w-3 h-3" /> Passed
                            </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{prop.title}</CardTitle>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-neutral-500 flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" /> {prop.timeLeft}
                      </div>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-sm text-neutral-400 max-w-3xl">
                   {prop.description}
               </p>
               
               {/* Voting Bar */}
               <div className="space-y-2">
                   <div className="flex justify-between text-xs font-medium">
                       <span className="text-green-400">For {prop.votesFor}</span>
                       <span className="text-red-400">Against {prop.votesAgainst}</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                       <div className="h-full bg-green-500/50" style={{ width: prop.votesFor }}></div>
                       <div className="h-full bg-red-500/50" style={{ width: prop.votesAgainst }}></div>
                   </div>
               </div>

               <div className="pt-2 flex gap-3">
                   <Button variant="outline" size="sm" disabled={prop.status !== 'Active'}>Vote For</Button>
                   <Button variant="outline" size="sm" disabled={prop.status !== 'Active'} className="hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5">Vote Against</Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
