import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";
import { PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";

describe("Spectre Protocol - Trading Strategy Platform", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vault as Program<Vault>;
  
  // Test accounts
  const trader = provider.wallet;
  const user = Keypair.generate();
  const user2 = Keypair.generate();
  
  // Test data
  const STRATEGY_NAME = "Test Momentum Strategy";
  const STRATEGY_DESCRIPTION = "A test strategy for momentum trading";
  const PERFORMANCE_FEE_BPS = 2000; // 20%
  const INITIAL_DEPOSIT = new BN(10 * LAMPORTS_PER_SOL); // 10 SOL

  let strategyPDA: PublicKey;
  let positionPDA: PublicKey;
  let position2PDA: PublicKey;

  // Helper function to airdrop SOL
  async function airdrop(pubkey: PublicKey, amount: number) {
    const signature = await provider.connection.requestAirdrop(
      pubkey,
      amount * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  }

  before(async () => {
    // Airdrop to test users
    await airdrop(user.publicKey, 20);
    await airdrop(user2.publicKey, 15);

    // Derive PDAs
    [strategyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("strategy"), trader.publicKey.toBuffer()],
      program.programId
    );

    [positionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        user.publicKey.toBuffer(),
        strategyPDA.toBuffer(),
      ],
      program.programId
    );

    [position2PDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        user2.publicKey.toBuffer(),
        strategyPDA.toBuffer(),
      ],
      program.programId
    );
  });

  describe("Strategy Management", () => {
    it("Initializes a new trading strategy", async () => {
      const tx = await program.methods
        .initializeStrategy(
          STRATEGY_NAME,
          STRATEGY_DESCRIPTION,
          PERFORMANCE_FEE_BPS
        )
        .accounts({
          trader: trader.publicKey,
        } as any)
        .rpc();

      console.log("  ✓ Strategy initialized, tx:", tx);

      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.trader.toBase58()).to.equal(trader.publicKey.toBase58());
      expect(strategy.name).to.equal(STRATEGY_NAME);
      expect(strategy.description).to.equal(STRATEGY_DESCRIPTION);
      expect(strategy.performanceFeeBps).to.equal(PERFORMANCE_FEE_BPS);
      expect(strategy.totalSubscribers).to.equal(0);
      expect(strategy.isActive).to.be.true;
    });

    it("Updates strategy metadata", async () => {
      const NEW_NAME = "Updated Strategy Name";
      const NEW_DESCRIPTION = "Updated description for better clarity";

      const tx = await program.methods
        .updateStrategy(NEW_NAME, NEW_DESCRIPTION, null)
        .accounts({
          trader: trader.publicKey,
          strategy: strategyPDA,
        })
        .rpc();

      console.log("  ✓ Strategy updated, tx:", tx);

      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.name).to.equal(NEW_NAME);
      expect(strategy.description).to.equal(NEW_DESCRIPTION);
    });

    it("Deactivates a strategy", async () => {
      const tx = await program.methods
        .updateStrategy(null, null, false)
        .accounts({
          trader: trader.publicKey,
          strategy: strategyPDA,
        })
        .rpc();

      console.log("  ✓ Strategy deactivated, tx:", tx);

      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.isActive).to.be.false;
    });

    it("Reactivates a strategy", async () => {
      await program.methods
        .updateStrategy(null, null, true)
        .accounts({
          trader: trader.publicKey,
          strategy: strategyPDA,
        })
        .rpc();

      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.isActive).to.be.true;
    });

    it("Fails to update strategy with unauthorized trader", async () => {
      try {
        await program.methods
          .updateStrategy("Hacked Name", null, null)
          .accounts({
            trader: user.publicKey,
            strategy: strategyPDA,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("User Subscription", () => {
    it("Subscribes user to strategy with initial deposit", async () => {
      const strategyBefore = await program.account.strategy.fetch(strategyPDA);
      const subscribersBefore = strategyBefore.totalSubscribers;

      const tx = await program.methods
        .subscribeToStrategy(INITIAL_DEPOSIT)
        .accounts({
          user: user.publicKey,
        } as any)
        .signers([user])
        .rpc();

      console.log("  ✓ User subscribed, tx:", tx);

      // Verify position account
      const position = await program.account.userPosition.fetch(positionPDA);
      expect(position.user.toBase58()).to.equal(user.publicKey.toBase58());
      expect(position.strategy.toBase58()).to.equal(strategyPDA.toBase58());
      expect(position.initialBalance.toString()).to.equal(INITIAL_DEPOSIT.toString());
      expect(position.currentBalance.toString()).to.equal(INITIAL_DEPOSIT.toString());
      expect(position.isActive).to.be.true;

      // Verify strategy subscriber count increased
      const strategyAfter = await program.account.strategy.fetch(strategyPDA);
      expect(strategyAfter.totalSubscribers).to.equal(subscribersBefore + 1);
    });

    it("Subscribes second user to strategy", async () => {
      const deposit = new BN(5 * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .subscribeToStrategy(deposit)
        .accounts({
          user: user2.publicKey,
        } as any)
        .signers([user2])
        .rpc();

      console.log("  ✓ Second user subscribed, tx:", tx);

      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.totalSubscribers).to.equal(2);
    });

    it("Fails to subscribe with insufficient deposit", async () => {
      const tinyDeposit = new BN(0.1 * LAMPORTS_PER_SOL); // Less than minimum

      try {
        await program.methods
          .subscribeToStrategy(tinyDeposit)
          .accounts({
            user: user.publicKey,
          } as any)
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.toString()).to.include("InsufficientDeposit");
      }
    });
  });

  describe("Trade Execution", () => {
    it("Executes profitable trade", async () => {
      const tradeAmount = new BN(2 * LAMPORTS_PER_SOL);
      const profit = new BN(0.5 * LAMPORTS_PER_SOL);

      const positionBefore = await program.account.userPosition.fetch(positionPDA);
      const balanceBefore = positionBefore.currentBalance;

      const tx = await program.methods
        .executeTrade(tradeAmount, profit)
        .accounts({
          trader: trader.publicKey,
          strategy: strategyPDA,
          position: positionPDA,
        })
        .rpc();

      console.log("  ✓ Profitable trade executed, tx:", tx);

      const positionAfter = await program.account.userPosition.fetch(positionPDA);
      const expectedBalance = balanceBefore.add(profit);
      expect(positionAfter.currentBalance.toString()).to.equal(expectedBalance.toString());

      // Verify strategy volume increased
      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.totalVolumeTraded.gte(tradeAmount)).to.be.true;
    });

    it("Executes losing trade", async () => {
      const tradeAmount = new BN(1 * LAMPORTS_PER_SOL);
      const loss = new BN(-0.2 * LAMPORTS_PER_SOL);

      const positionBefore = await program.account.userPosition.fetch(positionPDA);
      const balanceBefore = positionBefore.currentBalance;

      const tx = await program.methods
        .executeTrade(tradeAmount, loss)
        .accounts({
          trader: trader.publicKey,
          strategy: strategyPDA,
          position: positionPDA,
        })
        .rpc();

      console.log("  ✓ Losing trade executed, tx:", tx);

      const positionAfter = await program.account.userPosition.fetch(positionPDA);
      const expectedBalance = balanceBefore.sub(new BN(Math.abs(loss.toNumber())));
      expect(positionAfter.currentBalance.toString()).to.equal(expectedBalance.toString());
    });

    it("Fails when unauthorized user tries to execute trade", async () => {
      try {
        await program.methods
          .executeTrade(new BN(1 * LAMPORTS_PER_SOL), new BN(0))
          .accounts({
            trader: user.publicKey,
            strategy: strategyPDA,
            position: positionPDA,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("Fee Settlement", () => {
    it("Settles performance fees on profit", async () => {
      const positionBefore = await program.account.userPosition.fetch(positionPDA);
      const profit = positionBefore.currentBalance.sub(positionBefore.initialBalance);
      
      // Expected fee: profit * 20% (2000 bps)
      const expectedFee = profit.mul(new BN(PERFORMANCE_FEE_BPS)).div(new BN(10000));

      const traderBalanceBefore = await provider.connection.getBalance(trader.publicKey);

      const tx = await program.methods
        .settleFees()
        .accounts({
          user: user.publicKey,
          trader: trader.publicKey,
          strategy: strategyPDA,
          position: positionPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      console.log("  ✓ Fees settled, tx:", tx);

      const positionAfter = await program.account.userPosition.fetch(positionPDA);
      
      // Verify fee was deducted from position
      expect(positionAfter.totalFeesPaid.gte(expectedFee)).to.be.true;
      
      // Verify trader received fee
      const traderBalanceAfter = await provider.connection.getBalance(trader.publicKey);
      expect(traderBalanceAfter).to.be.greaterThan(traderBalanceBefore);

      // Verify initial balance was reset
      expect(positionAfter.initialBalance.toString()).to.equal(
        positionAfter.currentBalance.toString()
      );
    });

    it("Fails to settle fees when there's no profit", async () => {
      try {
        await program.methods
          .settleFees()
          .accounts({
            user: user.publicKey,
            trader: trader.publicKey,
            strategy: strategyPDA,
            position: positionPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.toString()).to.include("NoProfitToSettle");
      }
    });
  });

  describe("Unsubscribe & Withdrawal", () => {
    it("Unsubscribes user and withdraws funds", async () => {
      const positionBefore = await program.account.userPosition.fetch(positionPDA);
      const withdrawAmount = positionBefore.currentBalance;
      const userBalanceBefore = await provider.connection.getBalance(user.publicKey);

      const tx = await program.methods
        .unsubscribe()
        .accounts({
          user: user.publicKey,
          strategy: strategyPDA,
          position: positionPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      console.log("  ✓ User unsubscribed, tx:", tx);

      const positionAfter = await program.account.userPosition.fetch(positionPDA);
      expect(positionAfter.isActive).to.be.false;
      expect(positionAfter.currentBalance.toNumber()).to.equal(0);

      // Verify user received funds
      const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
      expect(userBalanceAfter).to.be.greaterThan(userBalanceBefore);

      // Verify strategy subscriber count decreased
      const strategy = await program.account.strategy.fetch(strategyPDA);
      expect(strategy.totalSubscribers).to.equal(1);
    });

    it("Fails to unsubscribe inactive position", async () => {
      try {
        await program.methods
          .unsubscribe()
          .accounts({
            user: user.publicKey,
            strategy: strategyPDA,
            position: positionPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.toString()).to.include("PositionInactive");
      }
    });
  });

  describe("Statistics & Aggregation", () => {
    it("Tracks accurate strategy statistics", async () => {
      const strategy = await program.account.strategy.fetch(strategyPDA);
      
      console.log("\n  📊 Strategy Statistics:");
      console.log("    • Total Subscribers:", strategy.totalSubscribers);
      console.log("    • Total Volume Traded:", strategy.totalVolumeTraded.toString(), "lamports");
      console.log("    • Total Fees Earned:", strategy.totalFeesEarned.toString(), "lamports");
      console.log("    • Performance Fee:", (strategy.performanceFeeBps / 100) + "%");
      console.log("    • Status:", strategy.isActive ? "Active" : "Inactive");

      expect(strategy.totalVolumeTraded.gtn(0)).to.be.true;
      expect(strategy.totalFeesEarned.gtn(0)).to.be.true;
    });
  });
});
