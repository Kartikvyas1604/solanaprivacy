'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Send, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Wallet as WalletIcon
} from 'lucide-react';
import { ClientWalletButton } from '@/components/ClientWalletButton';
import { Confidential } from '@/lib/confidential';
import { createPaymentSDK, hasConfidentialAccount } from '@/lib/payment-sdk';

// Mock confidential mint for demo
const CONFIDENTIAL_USDC_MINT = new PublicKey('11111111111111111111111111111111');

export default function PrivacyPaymentsPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [accountSetup, setAccountSetup] = useState(false);
  
  // Transfer state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  // Check if user has confidential account
  useEffect(() => {
    checkAccountSetup();
  }, [wallet.publicKey]);

  const checkAccountSetup = async () => {
    if (!wallet.publicKey) {
      setAccountSetup(false);
      return;
    }

    const hasAccount = await hasConfidentialAccount(
      connection,
      CONFIDENTIAL_USDC_MINT,
      wallet.publicKey
    );
    setAccountSetup(hasAccount);

    if (hasAccount) {
      loadBalance();
    }
  };

  const loadBalance = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const privateKey = Confidential.retrievePrivateKey(wallet.publicKey);
      if (privateKey) {
        const balanceData = await Confidential.fetchBalance(
          connection,
          CONFIDENTIAL_USDC_MINT,
          wallet.publicKey,
          privateKey
        );
        setBalance(balanceData.decryptedAmount || 0);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAccount = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const sdk = createPaymentSDK(connection, wallet);
      await sdk.initializeConfidentialAccount(CONFIDENTIAL_USDC_MINT);
      setAccountSetup(true);
      alert('✅ Confidential account initialized!');
    } catch (error) {
      console.error('Setup failed:', error);
      alert('Failed to setup account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amountInput = prompt('Enter amount to deposit (USDC):', '100');
    if (!amountInput) return;

    const depositAmount = parseFloat(amountInput);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      alert('Invalid amount');
      return;
    }

    setLoading(true);
    try {
      const sdk = createPaymentSDK(connection, wallet);
      const signature = await sdk.depositConfidential(
        CONFIDENTIAL_USDC_MINT,
        depositAmount
      );
      setTxSignature(signature);
      alert(`✅ Deposited ${depositAmount} USDC!\nBalance now encrypted.`);
      loadBalance();
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      alert('Invalid amount');
      return;
    }

    setSending(true);
    try {
      const recipientPubkey = new PublicKey(recipient);
      const sdk = createPaymentSDK(connection, wallet);
      
      const signature = await sdk.sendPrivatePayment(
        CONFIDENTIAL_USDC_MINT,
        recipientPubkey,
        sendAmount
      );
      
      setTxSignature(signature);
      alert(`✅ Private payment sent!\n${sendAmount} USDC → ${recipient.slice(0, 8)}...`);
      setRecipient('');
      setAmount('');
      loadBalance();
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Failed to send payment');
    } finally {
      setSending(false);
    }
  };

  const handleWithdraw = async () => {
    const amountInput = prompt('Enter amount to withdraw (USDC):', '50');
    if (!amountInput) return;

    const withdrawAmount = parseFloat(amountInput);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Invalid amount');
      return;
    }

    setLoading(true);
    try {
      const sdk = createPaymentSDK(connection, wallet);
      const signature = await sdk.withdrawConfidential(
        CONFIDENTIAL_USDC_MINT,
        withdrawAmount
      );
      setTxSignature(signature);
      alert(`✅ Withdrawn ${withdrawAmount} USDC to your wallet!`);
      loadBalance();
    } catch (error) {
      console.error('Withdraw failed:', error);
      alert('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-card/50 border-white/10">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto">
              <WalletIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-neutral-400 text-sm">
                Get started with private payments on Solana
              </p>
            </div>
            <ClientWalletButton className="w-full !bg-primary !text-black hover:!bg-primary/90" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accountSetup) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-card/50 border-white/10">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Setup Required</h2>
              <p className="text-neutral-400 text-sm">
                Initialize your confidential account to enable private payments
              </p>
            </div>
            <Button
              onClick={handleSetupAccount}
              disabled={loading}
              className="w-full !bg-primary !text-black hover:!bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Initialize Confidential Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-xl z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">SPECTRE</span>
              <span className="text-[10px] text-neutral-500 ml-2">PRIVACY PAYMENTS</span>
            </div>
          </div>
          <ClientWalletButton className="!bg-card !border !border-white/10 !text-white hover:!bg-white/5" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Encrypted Balance
              </CardTitle>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : showBalance ? (
              <div className="text-4xl font-bold font-mono">
                {balance !== null ? balance.toLocaleString() : '0'} <span className="text-xl text-neutral-400">USDC</span>
              </div>
            ) : (
              <div className="text-4xl font-bold blur-md select-none">
                ████████ <span className="text-xl">USDC</span>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button onClick={handleDeposit} variant="outline" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button onClick={handleWithdraw} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
              <Button onClick={loadBalance} variant="outline" size="icon">
                <Loader2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Send Payment */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Send Private Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendPayment} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter Solana address..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Amount (USDC)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50"
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !recipient || !amount}
                className="w-full !bg-primary !text-black hover:!bg-primary/90"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Payment (Encrypted)
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction Status */}
        {txSignature && (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-400 mb-1">Transaction Successful</h3>
                <p className="text-sm text-neutral-400 font-mono break-all">{txSignature}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Info */}
        <Card className="bg-card/30 border-white/5">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              How Privacy Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">1</div>
                <p className="text-neutral-400">
                  <span className="text-white font-medium">Encrypted Balances</span><br/>
                  Your balance is encrypted using ElGamal encryption. Only you can decrypt it.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">2</div>
                <p className="text-neutral-400">
                  <span className="text-white font-medium">Hidden Amounts</span><br/>
                  Transaction amounts are encrypted on-chain. Observers see `████` instead of numbers.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">3</div>
                <p className="text-neutral-400">
                  <span className="text-white font-medium">Zero-Knowledge Proofs</span><br/>
                  Prove you have sufficient funds without revealing your balance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
