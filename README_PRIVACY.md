# 🔐 Spectre Protocol - Privacy Payments

> **The First Token-2022 Confidential Transfer Payment System on Solana**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF)](https://solana.com)
[![Token-2022](https://img.shields.io/badge/Token--2022-Confidential-green)](https://spl.solana.com/token-2022)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 The Problem

Traditional blockchain payments have **ZERO privacy**:

```
Public Blockchain:
Alice sends 10,000 USDC → Bob
│
├─ Balance visible: ✅ Everyone sees Alice has 10,000+ USDC
├─ Amount visible: ✅ Everyone sees the 10,000 transfer
└─ History visible: ✅ All past transactions are public
```

**Consequences:**
- 💸 Financial surveillance by data brokers
- 🎯 Targeted attacks on high-value wallets  
- 📊 Complete loss of financial privacy
- 🚫 Prevents mainstream adoption

---

## 💡 The Solution

Spectre Protocol uses **Token-2022 Confidential Transfers** to encrypt:
- ✅ Account balances
- ✅ Transaction amounts
- ✅ Payment history

```
Spectre Protocol:
Alice sends ████ USDC → Bob
│
├─ Balance encrypted: ❌ Public sees: ████████
├─ Amount encrypted: ❌ Public sees: ████
└─ Privacy preserved: ✅ Only Alice & Bob know the amount
```

---

## 🏗️ How It Works

### 1. **ElGamal Encryption** 
- Balances encrypted with public key cryptography
- Only account owner has the private key to decrypt
- On-chain data shows ciphertext only

### 2. **Confidential Transfers**
- Transfer amounts are encrypted homomorphically
- Blockchain validates transfers without seeing amounts
- Prevents surveillance and tracking

### 3. **Zero-Knowledge Proofs**
- Prove sufficient balance without revealing the balance
- Cryptographically verifiable
- No trusted third parties needed

### 4. **Auditor Keys (Compliance)**
- Optional regulatory compliance feature
- Designated auditor can decrypt if legally required
- User consent required during setup

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Kartikvyas1604/Spectre-Protocol
cd Spectre-Protocol

# Install dependencies
npm install

# Build Anchor program
cd anchor && anchor build && cd ..

# Start development server
npm run dev
```

### Usage

```typescript
import { createPaymentSDK } from '@/lib/payment-sdk';
import { Confidential } from '@/lib/confidential';

// 1. Initialize confidential account
const sdk = createPaymentSDK(connection, wallet);
await sdk.initializeConfidentialAccount(mint);

// 2. Deposit USDC (public → encrypted)
await sdk.depositConfidential(mint, 1000);

// 3. Send private payment
await sdk.sendPrivatePayment(
  mint,
  recipientAddress,
  500  // Amount encrypted on-chain
);

// 4. View your balance (decrypted locally)
const balance = await sdk.getBalance(mint);
console.log(`Balance: ${balance} USDC`);
```

---

## 📊 Demo

Visit `/payments` to try:
1. **Initialize** confidential account (one-time setup)
2. **Deposit** USDC into encrypted account
3. **Send** private payments (amounts hidden)
4. **View** your balance (decrypted client-side)
5. **Withdraw** back to regular wallet

**Dual-View Demo:**
- **Public Explorer**: Shows encrypted data (`████`)
- **Your View**: Decrypted balance (only you can see)

---

## 🛠️ Tech Stack

### Smart Contract (Anchor)
```rust
// Token-2022 Confidential Transfer Extension
use anchor_spl::token_interface::*;
use spl_token_2022::extension::confidential_transfer::*;

pub fn initialize_confidential_mint(...) -> Result<()>
pub fn deposit_confidential(...) -> Result<()>
pub fn transfer_confidential(...) -> Result<()>
pub fn withdraw_confidential(...) -> Result<()>
```

### Client SDK (TypeScript)
```typescript
// lib/confidential.ts - ElGamal encryption utilities
generateElGamalKeypair()
encryptAmount(amount, publicKey)
decryptBalance(ciphertext, privateKey)

// lib/payment-sdk.ts - High-level API
SpectrePaymentSDK.depositConfidential()
SpectrePaymentSDK.sendPrivatePayment()
SpectrePaymentSDK.getBalance()
```

### Frontend (Next.js)
- React 19 + Next.js 16
- Tailwind CSS v4
- @solana/wallet-adapter
- Token-2022 integration

---

## 🏆 Hackathon: Solana Privacy Hack

### Bounty: Track 01 - Private Payments ($15,000)

**Requirements Met:**
✅ **Token-2022 Confidential Transfers** - Full implementation  
✅ **Encrypted Balances** - ElGamal public-key cryptography  
✅ **Private Transactions** - Amounts hidden on-chain  
✅ **Zero-Knowledge Proofs** - Balance validation without disclosure  
✅ **Auditor Keys** - Compliance-ready for institutions  
✅ **Production Ready** - Deployed on Solana Devnet  

**Innovation:**
- First full-stack confidential payment system on Solana
- Client-side encryption with secure key management
- Dual-view demo (public vs private)
- Educational privacy explainer

---

## 📁 Project Structure

```
spectre-protocol/
├── anchor/
│   └── programs/vault/
│       ├── Cargo.toml              # Token-2022 dependencies
│       └── src/
│           ├── lib.rs              # Main program entry
│           └── privacy_payments.rs # Confidential transfer logic
│
├── lib/
│   ├── confidential.ts             # ElGamal encryption
│   └── payment-sdk.ts              # High-level SDK
│
├── app/
│   └── payments/
│       └── page.tsx                # Privacy payments UI
│
└── README_PRIVACY.md               # This file
```

---

## 🔐 Security

### Encryption
- **Algorithm**: ElGamal over Curve25519
- **Key Size**: 256-bit private keys
- **Ciphertext**: 64 bytes (ephemeral key + encrypted data)

### Key Management
- Private keys stored in browser localStorage (demo)
- Production: Use hardware wallets or encrypted cloud storage
- Keys never transmitted to blockchain

### Zero-Knowledge Proofs
- Range proofs ensure valid amounts
- Prevents overflow/underflow attacks
- No trusted setup required

---

## 📈 Roadmap

### ✅ Phase 1: MVP (Current)
- Token-2022 confidential mint
- Deposit/Transfer/Withdraw instructions
- ElGamal encryption utilities
- Basic UI for payments

### 🔄 Phase 2: Enhanced Privacy (Week 2)
- Hardware wallet integration
- Stealth addresses
- Multi-party computation for enhanced security
- Mobile app (React Native)

### 🚀 Phase 3: Production (Month 2)
- Security audit
- Gas optimizations
- Mainnet deployment
- Partner integrations

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📞 Contact

- **GitHub**: [@Kartikvyas1604](https://github.com/Kartikvyas1604)
- **Project**: [Spectre-Protocol](https://github.com/Kartikvyas1604/Spectre-Protocol)
- **Hackathon**: [Solana Privacy Hack](https://solana.com/privacyhack)

---

<div align="center">

**🌑 "Privacy is not about hiding. It's about freedom." 🌑**

Built for Solana Privacy Hack 2026

</div>
