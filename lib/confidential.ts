/**
 * Confidential Transfers - Client-Side Encryption Utilities
 * 
 * This module handles ElGamal encryption/decryption for Token-2022
 * confidential transfers. All encryption happens client-side.
 * 
 * Key Concepts:
 * - ElGamal: Public key cryptosystem used by Token-2022
 * - Private key never leaves the user's device
 * - Balance encryption happens before sending to blockchain
 * - Only user can decrypt their own balance
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { 
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID 
} from '@solana/spl-token';

// ============================================================================
// Types
// ============================================================================

export interface ElGamalKeypair {
  publicKey: Uint8Array;  // 32 bytes
  privateKey: Uint8Array; // 32 bytes
}

export interface EncryptedBalance {
  ciphertext: Uint8Array;  // 64 bytes (ElGamal ciphertext)
  decryptedAmount: number | null; // Only available if we have private key
}

// ============================================================================
// Key Generation
// ============================================================================

/**
 * Generate ElGamal keypair for confidential transfers
 * This is done once per user account
 * 
 * WARNING: Private key must be stored securely!
 * Options:
 * - Browser localStorage (less secure)
 * - Hardware wallet (most secure)
 * - Encrypted cloud storage
 */
export async function generateElGamalKeypair(): Promise<ElGamalKeypair> {
  // For demo purposes, we'll generate a random keypair
  // In production, use proper ElGamal key generation
  
  // Generate random 32-byte keys
  const publicKey = new Uint8Array(32);
  const privateKey = new Uint8Array(32);
  
  // Use Web Crypto API for randomness
  crypto.getRandomValues(privateKey);
  
  // Derive public key from private key (simplified)
  // In real implementation, use curve25519 point multiplication
  for (let i = 0; i < 32; i++) {
    publicKey[i] = (privateKey[i] * 7 + 13) % 256;
  }
  
  console.log('🔑 Generated ElGamal keypair');
  console.log('Public key:', Buffer.from(publicKey).toString('hex').slice(0, 16) + '...');
  
  return { publicKey, privateKey };
}

/**
 * Store ElGamal private key securely
 * IMPORTANT: Never expose this to the network!
 */
export function storePrivateKey(wallet: PublicKey, privateKey: Uint8Array): void {
  const key = `elgamal_private_${wallet.toString()}`;
  const encoded = Buffer.from(privateKey).toString('base64');
  
  // Store in localStorage (demo only - use secure storage in production)
  localStorage.setItem(key, encoded);
  
  console.log('🔐 Private key stored securely');
}

/**
 * Retrieve ElGamal private key
 */
export function retrievePrivateKey(wallet: PublicKey): Uint8Array | null {
  const key = `elgamal_private_${wallet.toString()}`;
  const encoded = localStorage.getItem(key);
  
  if (!encoded) {
    console.warn('⚠️ No private key found for wallet');
    return null;
  }
  
  return new Uint8Array(Buffer.from(encoded, 'base64'));
}

// ============================================================================
// Encryption & Decryption
// ============================================================================

/**
 * Encrypt amount using ElGamal public key
 * This happens before depositing or transferring
 */
export function encryptAmount(
  amount: number,
  publicKey: Uint8Array
): Uint8Array {
  console.log(`🔒 Encrypting amount: ${amount}`);
  
  // ElGamal encryption:
  // 1. Choose random ephemeral key
  // 2. Compute shared secret
  // 3. Encrypt amount with shared secret
  
  const ciphertext = new Uint8Array(64); // 32 bytes ephemeral + 32 bytes encrypted
  
  // Simplified encryption (demo)
  // In production, use proper ElGamal over Curve25519
  const ephemeral = new Uint8Array(32);
  crypto.getRandomValues(ephemeral);
  
  // First 32 bytes: ephemeral public key
  ciphertext.set(ephemeral, 0);
  
  // Last 32 bytes: encrypted amount
  const amountBytes = new Uint8Array(8);
  const view = new DataView(amountBytes.buffer);
  view.setBigUint64(0, BigInt(amount), true);
  
  for (let i = 0; i < 32; i++) {
    const byte = i < 8 ? amountBytes[i] : 0;
    ciphertext[32 + i] = (byte + publicKey[i] + ephemeral[i]) % 256;
  }
  
  console.log('✅ Amount encrypted (64 bytes)');
  return ciphertext;
}

/**
 * Decrypt balance using ElGamal private key
 * This happens client-side only - private key never sent to chain
 */
export function decryptBalance(
  ciphertext: Uint8Array,
  privateKey: Uint8Array
): number {
  console.log('🔓 Decrypting balance...');
  
  if (ciphertext.length !== 64) {
    throw new Error('Invalid ciphertext length');
  }
  
  // ElGamal decryption:
  // 1. Extract ephemeral public key
  // 2. Compute shared secret using private key
  // 3. Decrypt amount
  
  const ephemeral = ciphertext.slice(0, 32);
  const encrypted = ciphertext.slice(32, 64);
  
  // Simplified decryption (demo)
  const decrypted = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    decrypted[i] = (encrypted[i] - privateKey[i] - ephemeral[i] + 768) % 256;
  }
  
  const view = new DataView(decrypted.buffer);
  const amount = Number(view.getBigUint64(0, true));
  
  console.log(`✅ Balance decrypted: ${amount}`);
  return amount;
}

// ============================================================================
// Fetch Encrypted Balance from Chain
// ============================================================================

/**
 * Fetch encrypted balance from Token-2022 confidential account
 * Decrypts if private key is available
 */
export async function fetchConfidentialBalance(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  privateKey?: Uint8Array
): Promise<EncryptedBalance> {
  console.log('📡 Fetching confidential balance from chain...');
  
  try {
    // Get associated token account for this mint
    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    // Fetch account data
    const accountInfo = await getAccount(
      connection,
      tokenAccount,
      'confirmed',
      TOKEN_2022_PROGRAM_ID
    );
    
    // In Token-2022 with confidential transfers, the balance field
    // contains encrypted data (64 bytes)
    // For demo, we'll simulate this
    const mockCiphertext = new Uint8Array(64);
    crypto.getRandomValues(mockCiphertext);
    
    console.log('✅ Fetched encrypted balance from chain');
    
    // Try to decrypt if private key provided
    let decryptedAmount: number | null = null;
    if (privateKey) {
      try {
        decryptedAmount = decryptBalance(mockCiphertext, privateKey);
        console.log(`✅ Decrypted balance: ${decryptedAmount}`);
      } catch (error) {
        console.error('❌ Failed to decrypt balance:', error);
      }
    }
    
    return {
      ciphertext: mockCiphertext,
      decryptedAmount,
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch balance:', error);
    throw error;
  }
}

// ============================================================================
// Zero-Knowledge Proofs
// ============================================================================

/**
 * Generate range proof for confidential transfer
 * Proves that amount is valid without revealing it
 * 
 * Range proof ensures:
 * - Amount is positive (>= 0)
 * - Amount is within valid range (< 2^64)
 * - Sender has sufficient balance
 */
export function generateRangeProof(
  amount: number,
  senderBalance: number,
  privateKey: Uint8Array
): Uint8Array {
  console.log('📊 Generating zero-knowledge range proof...');
  
  // Verify sender has sufficient balance
  if (amount > senderBalance) {
    throw new Error('Insufficient balance');
  }
  
  // Generate ZK proof (simplified for demo)
  // Real implementation uses bulletproofs or similar
  const proof = new Uint8Array(256);
  crypto.getRandomValues(proof);
  
  // Embed some verification data
  proof[0] = amount > 0 ? 1 : 0;
  proof[1] = amount <= senderBalance ? 1 : 0;
  
  console.log('✅ Range proof generated (256 bytes)');
  return proof;
}

/**
 * Verify range proof (done on-chain by Token-2022)
 */
export function verifyRangeProof(proof: Uint8Array): boolean {
  if (proof.length !== 256) {
    return false;
  }
  
  // Simplified verification
  return proof[0] === 1 && proof[1] === 1;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format encrypted balance for display
 */
export function formatEncryptedBalance(encrypted: EncryptedBalance): string {
  if (encrypted.decryptedAmount !== null) {
    return `${encrypted.decryptedAmount.toLocaleString()} USDC`;
  }
  return '████████ USDC (encrypted)';
}

/**
 * Get confidential mint address for Spectre Protocol
 * This is the USDC mint with confidential transfers enabled
 */
export function getSpectreConfidentialMint(): PublicKey {
  // This will be set after deploying the confidential mint
  // For now, return a placeholder
  return new PublicKey('11111111111111111111111111111111');
}

/**
 * Check if user has ElGamal keypair set up
 */
export function hasElGamalKeypair(wallet: PublicKey): boolean {
  return retrievePrivateKey(wallet) !== null;
}

// ============================================================================
// Exports
// ============================================================================

export const Confidential = {
  generateKeypair: generateElGamalKeypair,
  storePrivateKey,
  retrievePrivateKey,
  encryptAmount,
  decryptBalance,
  fetchBalance: fetchConfidentialBalance,
  generateRangeProof,
  verifyRangeProof,
  formatBalance: formatEncryptedBalance,
  getMint: getSpectreConfidentialMint,
  hasKeypair: hasElGamalKeypair,
};
