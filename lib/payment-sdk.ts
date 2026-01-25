/**
 * Spectre Privacy Payment SDK
 * 
 * High-level wrapper for Token-2022 confidential transfers
 * Makes it easy to:
 * - Initialize confidential accounts
 * - Deposit funds privately
 * - Send encrypted payments
 * - Withdraw with decryption
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { Confidential } from './confidential';

// Program ID - deployed Spectre Protocol
export const SPECTRE_PROGRAM_ID = new PublicKey(
  'HbB8vSpkaaNpdcQSNX2L4Cd6uYGZuJRLy18wk5mXE2VV'
);

// ============================================================================
// Main SDK Class
// ============================================================================

export class SpectrePaymentSDK {
  private connection: Connection;
  private wallet: WalletContextState;
  private program?: anchor.Program;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection;
    this.wallet = wallet;
  }

  // ==========================================================================
  // 1. SETUP - Initialize Confidential Account
  // ==========================================================================

  /**
   * Initialize user's confidential payment account
   * This is done once per user
   */
  async initializeConfidentialAccount(
    mint: PublicKey
  ): Promise<{ signature: string; elgamalKeypair: any }> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    console.log('🚀 Initializing confidential account...');

    // Step 1: Generate ElGamal keypair for encryption
    const elgamalKeypair = await Confidential.generateKeypair();
    
    // Step 2: Store private key securely
    Confidential.storePrivateKey(this.wallet.publicKey, elgamalKeypair.privateKey);

    // Step 3: Create associated token account with confidential extension
    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction();

    // Create ATA instruction
    transaction.add(
      createAssociatedTokenAccountInstruction(
        this.wallet.publicKey,
        tokenAccount,
        this.wallet.publicKey,
        mint,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    // Step 4: Configure confidential transfers on the account
    // This would call our Anchor program's initialize_user_account instruction
    const initInstruction = await this.createInitUserAccountInstruction(
      mint,
      tokenAccount,
      elgamalKeypair.publicKey
    );
    transaction.add(initInstruction);

    // Send transaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    const signed = await this.wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );

    await this.connection.confirmTransaction(signature);

    console.log('✅ Confidential account initialized');
    console.log('📝 Signature:', signature);

    return { signature, elgamalKeypair };
  }

  // ==========================================================================
  // 2. DEPOSIT - Convert public USDC to encrypted balance
  // ==========================================================================

  /**
   * Deposit USDC into confidential account
   * Public amount → Encrypted balance
   */
  async depositConfidential(
    mint: PublicKey,
    amount: number
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    console.log(`💰 Depositing ${amount} tokens...`);

    // Get token accounts
    const sourceAccount = getAssociatedTokenAddressSync(
      mint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const confidentialAccount = getAssociatedTokenAddressSync(
      mint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    // Create deposit instruction via our Anchor program
    const depositInstruction = await this.createDepositInstruction(
      mint,
      sourceAccount,
      confidentialAccount,
      amount
    );

    const transaction = new Transaction().add(depositInstruction);

    // Send transaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    const signed = await this.wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );

    await this.connection.confirmTransaction(signature);

    console.log('✅ Deposit successful - balance now encrypted');
    console.log('📝 Signature:', signature);

    return signature;
  }

  // ==========================================================================
  // 3. TRANSFER - Send private payment
  // ==========================================================================

  /**
   * Send confidential payment to recipient
   * Amount is encrypted on-chain
   */
  async sendPrivatePayment(
    mint: PublicKey,
    recipient: PublicKey,
    amount: number
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    console.log(`🔒 Sending private payment of ${amount} to ${recipient.toString()}`);

    // Get private key for encryption
    const privateKey = Confidential.retrievePrivateKey(this.wallet.publicKey);
    if (!privateKey) {
      throw new Error('ElGamal private key not found. Initialize account first.');
    }

    // Fetch current balance to generate proof
    const balance = await Confidential.fetchBalance(
      this.connection,
      mint,
      this.wallet.publicKey,
      privateKey
    );

    if (!balance.decryptedAmount || balance.decryptedAmount < amount) {
      throw new Error('Insufficient balance');
    }

    // Encrypt the transfer amount
    const elgamalKeypair = {
      publicKey: new Uint8Array(32),
      privateKey,
    };
    const encryptedAmount = Confidential.encryptAmount(
      amount,
      elgamalKeypair.publicKey
    );

    // Generate zero-knowledge range proof
    const proof = Confidential.generateRangeProof(
      amount,
      balance.decryptedAmount,
      privateKey
    );

    // Get token accounts
    const senderAccount = getAssociatedTokenAddressSync(
      mint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const recipientAccount = getAssociatedTokenAddressSync(
      mint,
      recipient,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    // Create transfer instruction
    const transferInstruction = await this.createTransferInstruction(
      mint,
      senderAccount,
      recipientAccount,
      encryptedAmount,
      proof
    );

    const transaction = new Transaction().add(transferInstruction);

    // Send transaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    const signed = await this.wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );

    await this.connection.confirmTransaction(signature);

    console.log('✅ Private payment sent - amount encrypted on-chain');
    console.log('📝 Signature:', signature);

    return signature;
  }

  // ==========================================================================
  // 4. WITHDRAW - Convert encrypted balance to public USDC
  // ==========================================================================

  /**
   * Withdraw from confidential account to regular wallet
   */
  async withdrawConfidential(
    mint: PublicKey,
    amount: number
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    console.log(`💸 Withdrawing ${amount} tokens...`);

    // Get token accounts
    const confidentialAccount = getAssociatedTokenAddressSync(
      mint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const destinationAccount = getAssociatedTokenAddressSync(
      mint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    // Create withdraw instruction
    const withdrawInstruction = await this.createWithdrawInstruction(
      mint,
      confidentialAccount,
      destinationAccount,
      amount
    );

    const transaction = new Transaction().add(withdrawInstruction);

    // Send transaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    const signed = await this.wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );

    await this.connection.confirmTransaction(signature);

    console.log('✅ Withdrawal successful');
    console.log('📝 Signature:', signature);

    return signature;
  }

  // ==========================================================================
  // 5. VIEW BALANCE - Decrypt and display
  // ==========================================================================

  /**
   * Get user's confidential balance (decrypted)
   */
  async getBalance(mint: PublicKey): Promise<number | null> {
    if (!this.wallet.publicKey) {
      return null;
    }

    const privateKey = Confidential.retrievePrivateKey(this.wallet.publicKey);
    if (!privateKey) {
      console.warn('No private key found - cannot decrypt balance');
      return null;
    }

    const balance = await Confidential.fetchBalance(
      this.connection,
      mint,
      this.wallet.publicKey,
      privateKey
    );

    return balance.decryptedAmount;
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  private async createInitUserAccountInstruction(
    mint: PublicKey,
    tokenAccount: PublicKey,
    elgamalPublicKey: Uint8Array
  ): Promise<TransactionInstruction> {
    // Call Anchor program's initialize_user_account instruction
    // This is a simplified version - full implementation would use Anchor SDK
    
    const keys = [
      { pubkey: this.wallet.publicKey!, isSigner: true, isWritable: true },
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    // Instruction discriminator for initialize_user_account
    const discriminator = Buffer.from([/* add discriminator */]);
    const data = Buffer.concat([discriminator, Buffer.from(elgamalPublicKey)]);

    return new TransactionInstruction({
      keys,
      programId: SPECTRE_PROGRAM_ID,
      data,
    });
  }

  private async createDepositInstruction(
    mint: PublicKey,
    source: PublicKey,
    destination: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    const keys = [
      { pubkey: this.wallet.publicKey!, isSigner: true, isWritable: true },
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const discriminator = Buffer.from([/* deposit discriminator */]);
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(BigInt(amount));
    const data = Buffer.concat([discriminator, amountBuffer]);

    return new TransactionInstruction({
      keys,
      programId: SPECTRE_PROGRAM_ID,
      data,
    });
  }

  private async createTransferInstruction(
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey,
    encryptedAmount: Uint8Array,
    proof: Uint8Array
  ): Promise<TransactionInstruction> {
    const keys = [
      { pubkey: this.wallet.publicKey!, isSigner: true, isWritable: true },
      { pubkey: sender, isSigner: false, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const discriminator = Buffer.from([/* transfer discriminator */]);
    const data = Buffer.concat([
      discriminator,
      Buffer.from(encryptedAmount),
      Buffer.from(proof),
    ]);

    return new TransactionInstruction({
      keys,
      programId: SPECTRE_PROGRAM_ID,
      data,
    });
  }

  private async createWithdrawInstruction(
    mint: PublicKey,
    source: PublicKey,
    destination: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    const keys = [
      { pubkey: this.wallet.publicKey!, isSigner: true, isWritable: true },
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const discriminator = Buffer.from([/* withdraw discriminator */]);
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(BigInt(amount));
    const data = Buffer.concat([discriminator, amountBuffer]);

    return new TransactionInstruction({
      keys,
      programId: SPECTRE_PROGRAM_ID,
      data,
    });
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create SDK instance
 */
export function createPaymentSDK(
  connection: Connection,
  wallet: WalletContextState
): SpectrePaymentSDK {
  return new SpectrePaymentSDK(connection, wallet);
}

/**
 * Check if user has confidential account set up
 */
export async function hasConfidentialAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<boolean> {
  try {
    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    return accountInfo !== null && Confidential.hasKeypair(owner);
  } catch {
    return false;
  }
}
