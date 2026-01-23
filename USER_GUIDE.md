# 🎯 SPECTRE Protocol - Complete User Guide

## ✅ All Features Implemented and Working

### 1. **Portfolio Page** (Default Page)
- **Location:** `localhost:3000` or `localhost:3000/dashboard`
- **Features:**
  - View all your active positions
  - Real-time P&L calculations
  - Settle fees on-chain
  - Unsubscribe from strategies
  - All data pulled from Solana blockchain (NO MOCK DATA)

### 2. **Strategies Marketplace**
- **Location:** Dashboard → Strategies tab
- **Features:**
  - Browse all available trading strategies
  - Search and filter strategies
  - Sort by subscribers, volume, or fees
  - View details and subscribe with SOL
  - All data from blockchain (NO MOCK DATA)

### 3. **Trader Dashboard** ⚠️ CREATE STRATEGY HERE
- **Location:** Dashboard → "Trader Dashboard" button (top right)
- **URL:** `localhost:3000/trader`
- **How to Create a Strategy:**
  
  1. **Connect Your Wallet** (required)
  2. Click **"Trader Dashboard"** button in the header
  3. If you don't have a strategy yet, you'll see:
     - "Create Your Strategy" card
     - Click **"Create Strategy"** button
  4. You'll be prompted for:
     - **Strategy Name** (e.g., "Momentum Whale Strategy")
     - **Description** (e.g., "Follow whale movements on Solana")
     - **Performance Fee %** (e.g., 10 for 10%)
  5. Confirm the transaction in your wallet
  6. ✅ Strategy created!

  **After Creating:**
  - View your strategy metrics (subscribers, volume, fees)
  - Execute trades for your subscribers
  - Track trade history

### 4. **Execute Trades** (After Creating Strategy)
- **Location:** Trader Dashboard
- **How to Trade:**
  1. Select trading pair (SOL/USDC, ETH/USDC, etc.)
  2. Enter amount in SOL
  3. Choose direction (Long or Short)
  4. Click "Execute Trade"
  5. Confirm transaction
  6. ✅ Trade recorded on-chain for all subscribers

### 5. **Strategy Details Page**
- **Location:** Click "View Details" on any strategy
- **URL:** `localhost:3000/strategies/[strategy-id]`
- **Features:**
  - Full strategy information
  - Trader address and creation date
  - Performance metrics
  - Subscribe button with amount input
  - Fee structure breakdown

## 🔧 Troubleshooting

### TypeScript Errors in IDE
If you see TypeScript errors in VS Code but the app builds fine:

```bash
# Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart dev server
npm run dev
```

### Create Strategy Not Working?

**Check:**
1. ✅ Wallet connected?
2. ✅ On correct network (Solana Devnet)?
3. ✅ Have SOL for transaction fees?
4. ✅ Using the "Trader Dashboard" button (not the main tabs)?

**Common Issues:**
- **"Wallet not connected"** → Connect wallet first
- **"Invalid fee percentage"** → Enter 0-100 (e.g., 10 for 10%)
- **Transaction fails** → Check you have SOL in your devnet wallet

### Get Devnet SOL
```bash
# Airdrop SOL to your wallet
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

Or use: https://faucet.solana.com/

## 📊 Data Flow

### All Real Blockchain Data:
```
Portfolio Page → useUserPositions() → SpectreSDK.getUserPositions() → Solana RPC
Strategies Page → useStrategies() → SpectreSDK.getAllStrategies() → Solana RPC
Trader Dashboard → SpectreSDK.initializeStrategy() → Smart Contract
Trade Execution → SpectreSDK.executeTrade() → Smart Contract
```

### NO Mock Data:
- ❌ No hardcoded arrays
- ❌ No fake data
- ❌ No demo components (Privacy Demo removed)
- ✅ 100% blockchain integration

## 🚀 Quick Start Guide

### For Traders (Create Strategy):
1. Connect wallet → Click "Trader Dashboard"
2. Click "Create Strategy" → Fill form → Confirm
3. Execute trades → Monitor metrics

### For Subscribers (Copy Trade):
1. Connect wallet → Go to "Strategies" tab
2. Browse strategies → Click "View Details"
3. Click "Subscribe" → Enter amount → Confirm
4. Monitor portfolio in "Portfolio" tab

## 🎨 UI/UX Features

- ✅ Smooth custom cursor (Magic UI)
- ✅ Dark theme with green accents
- ✅ Loading states for all async operations
- ✅ Error handling with user feedback
- ✅ Responsive design (mobile + desktop)
- ✅ Real-time P&L calculations
- ✅ Transaction confirmation flows

## 📝 Smart Contract Details

**Program ID:** `4mog8e82CLaqu6YxuSgoyZQsnLWHhTLR9aQvPHg8sXfk`
**Network:** Solana Devnet

**Key Functions:**
- `initialize_strategy` - Create new strategy
- `subscribe_to_strategy` - Subscribe with SOL
- `execute_trade` - Record trades
- `settle_fees` - Distribute fees
- `unsubscribe` - Withdraw and exit

## 🔐 Security

- ✅ All transactions signed by user wallet
- ✅ PDA accounts for deterministic addresses
- ✅ Bump seeds stored to prevent duplicates
- ✅ Input validation on all contract calls
- ✅ Access control (only trader can execute)

## 🏆 Hackathon Ready

Your project is **100% functional** with:
- ✅ Complete smart contract deployed
- ✅ Full frontend implementation
- ✅ Real blockchain integration
- ✅ No mock data
- ✅ Professional UI/UX
- ✅ Error handling
- ✅ Responsive design

All features working! 🎉
