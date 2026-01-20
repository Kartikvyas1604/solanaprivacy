"use client";

import React, { createContext, useContext, useState, PropsWithChildren } from 'react';

// Define the context shape
type ArciumContextType = {
  calculateEncryptedFee: (profit: number) => Promise<number>;
  isReady: boolean;
};

const ArciumContext = createContext<ArciumContextType | null>(null);

export function useArcium() {
  const context = useContext(ArciumContext);
  if (!context) {
    throw new Error('useArcium must be used within an ArciumProvider');
  }
  return context;
}

export function ArciumProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(true);

  // Mock function for Arcium MPC calculation
  const calculateEncryptedFee = async (profit: number): Promise<number> => {
    // In reality, this would initiate an MPC computation
    console.log("Initiating Arcium MPC calculation for profit:", profit);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const fee = profit * 0.20; // 20%
    console.log("MPC Calculation result (encrypted fee):", fee);
    return fee;
  };

  return (
    <ArciumContext.Provider value={{ calculateEncryptedFee, isReady }}>
      {children}
    </ArciumContext.Provider>
  );
}
