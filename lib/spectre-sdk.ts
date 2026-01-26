import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { AnchorProvider, Program, web3, BN, Idl } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import vaultIdl from './vault-idl.json';

// Program ID - Deployed on Solana Devnet
export const PROGRAM_ID = new PublicKey('HbB8vSpkaaNpdcQSNX2L4Cd6uYGZuJRLy18wk5mXE2VV');

export interface Strategy {
  publicKey: PublicKey;
  trader: PublicKey;
  name: string;
  description: string;
  performanceFeeBps: number;
  totalSubscribers: number;
  totalVolumeTraded: BN;
  totalFeesEarned: BN;
  isActive: boolean;
  createdAt: BN;
  bump: number;
}

export interface UserPosition {
  publicKey: PublicKey;
  user: PublicKey;
  strategy: PublicKey;
  initialBalance: BN;
  currentBalance: BN;
  totalFeesPaid: BN;
  lastFeeSettlement: BN;
  subscribedAt: BN;
  isActive: boolean;
  bump: number;
}

export class SpectreSDK {
  private connection: Connection;
  private provider?: AnchorProvider;
  private program?: Program<Idl>;

  constructor(connection: Connection, wallet?: WalletContextState) {
    this.connection = connection;
    
    if (wallet && wallet.publicKey) {
      this.provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );
      this.program = new Program(vaultIdl as Idl, this.provider);
    }
  }

  /**
   * Get strategy PDA address
   */
  getStrategyAddress(trader: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('strategy'), trader.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get position PDA address
   */
  getPositionAddress(user: PublicKey, strategy: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('position'), user.toBuffer(), strategy.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Initialize a new trading strategy
   */
  async initializeStrategy(
    trader: PublicKey,
    name: string,
    description: string,
    performanceFeeBps: number
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error('Wallet not connected');
    }

    const [strategyPDA] = this.getStrategyAddress(trader);

    const tx = await this.program.methods
      .initializeStrategy(name, description, performanceFeeBps)
      .accounts({
        trader,
        strategy: strategyPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Update strategy metadata
   */
  async updateStrategy(
    trader: PublicKey,
    updates: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error('Wallet not connected');
    }

    const [strategyPDA] = this.getStrategyAddress(trader);

    const tx = await this.program.methods
      .updateStrategy(
        updates.name || null,
        updates.description || null,
        updates.isActive !== undefined ? updates.isActive : null
      )
      .accounts({
        trader,
        strategy: strategyPDA,
      })
      .rpc();

    return tx;
  }

  /**
   * Subscribe to a trading strategy
   */
  async subscribeToStrategy(
    user: PublicKey,
    strategyKey: PublicKey,
    initialDeposit: number // in SOL
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error('Wallet not connected');
    }

    // Check if user already has a position
    const existingPosition = await this.getUserPosition(user, strategyKey);
    if (existingPosition && existingPosition.isActive) {
      throw new Error('You are already subscribed to this strategy');
    }

    const [positionPDA] = this.getPositionAddress(user, strategyKey);
    const depositLamports = new BN(initialDeposit * LAMPORTS_PER_SOL);

    const tx = await this.program.methods
      .subscribeToStrategy(depositLamports)
      .accounts({
        user,
        strategy: strategyKey,
        position: positionPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Execute a trade (trader only)
   */
  async executeTrade(
    trader: PublicKey,
    positionKey: PublicKey,
    amount: number, // in lamports
    profitOrLoss: number // in lamports, can be negative
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error('Wallet not connected');
    }

    const [strategyPDA] = this.getStrategyAddress(trader);

    const tx = await this.program.methods
      .executeTrade(new BN(amount), new BN(profitOrLoss))
      .accounts({
        trader,
        strategy: strategyPDA,
        position: positionKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Settle performance fees
   */
  async settleFees(
    user: PublicKey,
    strategyKey: PublicKey
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error('Wallet not connected');
    }

    const [positionPDA] = this.getPositionAddress(user, strategyKey);
    
    // Fetch strategy to get trader address
    const strategy = await this.getStrategy(strategyKey);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    const tx = await this.program.methods
      .settleFees()
      .accounts({
        user,
        trader: strategy.trader,
        strategy: strategyKey,
        position: positionPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Unsubscribe from strategy and withdraw funds
   */
  async unsubscribe(
    user: PublicKey,
    strategyKey: PublicKey
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error('Wallet not connected');
    }

    const [positionPDA] = this.getPositionAddress(user, strategyKey);

    const tx = await this.program.methods
      .unsubscribe()
      .accounts({
        user,
        strategy: strategyKey,
        position: positionPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Fetch a single strategy
   */
  async getStrategy(strategyKey: PublicKey): Promise<Strategy | null> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const strategy = await (this.program.account as any).strategy.fetch(strategyKey);
      return {
        publicKey: strategyKey,
        ...strategy,
      } as Strategy;
    } catch (error) {
      console.error('Failed to fetch strategy:', error);
      return null;
    }
  }

  /**
   * Fetch all strategies
   */
  async getAllStrategies(): Promise<Strategy[]> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const strategies = await (this.program.account as any).strategy.all();
      return strategies.map((s: any) => ({
        publicKey: s.publicKey,
        ...s.account,
      })) as Strategy[];
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      return [];
    }
  }

  /**
   * Fetch active strategies only
   */
  async getActiveStrategies(): Promise<Strategy[]> {
    const allStrategies = await this.getAllStrategies();
    return allStrategies.filter((s) => s.isActive);
  }

  /**
   * Fetch user position
   */
  async getUserPosition(
    user: PublicKey,
    strategyKey: PublicKey
  ): Promise<UserPosition | null> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    const [positionPDA] = this.getPositionAddress(user, strategyKey);

    try {
      const position = await (this.program.account as any).userPosition.fetch(positionPDA);
      return {
        publicKey: positionPDA,
        ...position,
      } as UserPosition;
    } catch (error) {
      console.error('Failed to fetch position:', error);
      return null;
    }
  }

  /**
   * Fetch all positions for a user
   */
  async getUserPositions(user: PublicKey): Promise<UserPosition[]> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const positions = await (this.program.account as any).userPosition.all([
        {
          memcmp: {
            offset: 8, // Discriminator
            bytes: user.toBase58(),
          },
        },
      ]);

      return positions.map((p: any) => ({
        publicKey: p.publicKey,
        ...p.account,
      })) as UserPosition[];
    } catch (error) {
      console.error('Failed to fetch user positions:', error);
      return [];
    }
  }

  /**
   * Fetch all active positions for a user
   */
  async getActiveUserPositions(user: PublicKey): Promise<UserPosition[]> {
    const allPositions = await this.getUserPositions(user);
    return allPositions.filter((p) => p.isActive);
  }

  /**
   * Fetch all positions for a strategy
   */
  async getStrategyPositions(strategyKey: PublicKey): Promise<UserPosition[]> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const positions = await (this.program.account as any).userPosition.all([
        {
          memcmp: {
            offset: 8 + 32, // Discriminator + user pubkey
            bytes: strategyKey.toBase58(),
          },
        },
      ]);

      return positions.map((p: any) => ({
        publicKey: p.publicKey,
        ...p.account,
      })) as UserPosition[];
    } catch (error) {
      console.error('Failed to fetch strategy positions:', error);
      return [];
    }
  }

  /**
   * Fetch all active positions for a strategy
   */
  async getActiveStrategyPositions(strategyKey: PublicKey): Promise<UserPosition[]> {
    const allPositions = await this.getStrategyPositions(strategyKey);
    return allPositions.filter((p) => p.isActive);
  }

  /**
   * Calculate position P&L
   */
  calculatePnL(position: UserPosition): {
    pnl: BN;
    pnlPercentage: number;
  } {
    const pnl = position.currentBalance.sub(position.initialBalance);
    const pnlPercentage = position.initialBalance.isZero()
      ? 0
      : (pnl.toNumber() / position.initialBalance.toNumber()) * 100;

    return { pnl, pnlPercentage };
  }

  /**
   * Format lamports to SOL
   */
  lamportsToSol(lamports: BN | number): number {
    const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
    return amount / LAMPORTS_PER_SOL;
  }

  /**
   * Format SOL to lamports
   */
  solToLamports(sol: number): BN {
    return new BN(sol * LAMPORTS_PER_SOL);
  }

  /**
   * Format basis points to percentage
   */
  bpsToPercentage(bps: number): number {
    return bps / 100;
  }
}

/**
 * Create SDK instance with wallet connection
 */
export function createSpectreSDK(
  connection: Connection,
  wallet?: WalletContextState
): SpectreSDK {
  return new SpectreSDK(connection, wallet);
}

/**
 * Utility functions
 */
export const utils = {
  formatSOL: (lamports: number | BN): string => {
    const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
    return (amount / LAMPORTS_PER_SOL).toFixed(2);
  },

  formatPercentage: (value: number): string => {
    return `${value.toFixed(2)}%`;
  },

  formatFee: (bps: number): string => {
    return `${(bps / 100).toFixed(1)}%`;
  },

  formatTimestamp: (timestamp: BN | number): string => {
    const ts = typeof timestamp === 'number' ? timestamp : timestamp.toNumber();
    return new Date(ts * 1000).toLocaleDateString();
  },

  shortenAddress: (address: PublicKey | string): string => {
    const str = typeof address === 'string' ? address : address.toBase58();
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  },
};
