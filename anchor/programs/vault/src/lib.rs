use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[cfg(test)]
mod tests;

declare_id!("4mog8e82CLaqu6YxuSgoyZQsnLWHhTLR9aQvPHg8sXfk");

// Constants for validation
const MAX_NAME_LENGTH: usize = 50;
const MAX_DESCRIPTION_LENGTH: usize = 500;
const MAX_FEE_BPS: u16 = 5000; // 50% maximum fee
const MIN_STAKE_AMOUNT: u64 = 1_000_000_000; // 1 SOL minimum stake
const BASIS_POINTS_DIVISOR: u64 = 10_000;

#[program]
pub mod vault {
    use super::*;

    pub fn initialize_strategy(
        ctx: Context<InitializeStrategy>,
        name: String,
        description: String,
        performance_fee_bps: u16,
    ) -> Result<()> {
        // Validation
        require!(
            name.len() <= MAX_NAME_LENGTH,
            VaultError::NameTooLong
        );
        require!(
            description.len() <= MAX_DESCRIPTION_LENGTH,
            VaultError::DescriptionTooLong
        );
        require!(
            performance_fee_bps <= MAX_FEE_BPS,
            VaultError::FeeTooHigh
        );

        let strategy = &mut ctx.accounts.strategy;
        let clock = Clock::get()?;

        strategy.trader = ctx.accounts.trader.key();
        strategy.name = name;
        strategy.description = description;
        strategy.performance_fee_bps = performance_fee_bps;
        strategy.total_subscribers = 0;
        strategy.total_volume_traded = 0;
        strategy.total_fees_earned = 0;
        strategy.is_active = true;
        strategy.created_at = clock.unix_timestamp;
        strategy.bump = ctx.bumps.strategy;

        emit!(StrategyCreated {
            strategy: strategy.key(),
            trader: strategy.trader,
            name: strategy.name.clone(),
            performance_fee_bps,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Update strategy metadata (only trader can update)
    pub fn update_strategy(
        ctx: Context<UpdateStrategy>,
        name: Option<String>,
        description: Option<String>,
        is_active: Option<bool>,
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;

        if let Some(new_name) = name {
            require!(
                new_name.len() <= MAX_NAME_LENGTH,
                VaultError::NameTooLong
            );
            strategy.name = new_name;
        }

        if let Some(new_desc) = description {
            require!(
                new_desc.len() <= MAX_DESCRIPTION_LENGTH,
                VaultError::DescriptionTooLong
            );
            strategy.description = new_desc;
        }

        if let Some(active) = is_active {
            strategy.is_active = active;
        }

        emit!(StrategyUpdated {
            strategy: strategy.key(),
            trader: strategy.trader,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Subscribe to a trading strategy
    /// Users deposit funds and subscribe to follow a trader's strategy
    pub fn subscribe_to_strategy(
        ctx: Context<SubscribeToStrategy>,
        initial_deposit: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.strategy.is_active,
            VaultError::StrategyInactive
        );
        require!(
            initial_deposit >= MIN_STAKE_AMOUNT,
            VaultError::InsufficientDeposit
        );

        let clock = Clock::get()?;

        // Transfer SOL from user to position PDA
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.position.to_account_info(),
                },
            ),
            initial_deposit,
        )?;

        // Initialize position
        let position = &mut ctx.accounts.position;
        position.user = ctx.accounts.user.key();
        position.strategy = ctx.accounts.strategy.key();
        position.initial_balance = initial_deposit;
        position.current_balance = initial_deposit;
        position.total_fees_paid = 0;
        position.last_fee_settlement = clock.unix_timestamp;
        position.subscribed_at = clock.unix_timestamp;
        position.is_active = true;
        position.bump = ctx.bumps.position;

        // Update strategy stats
        let strategy = &mut ctx.accounts.strategy;
        strategy.total_subscribers = strategy.total_subscribers.checked_add(1)
            .ok_or(VaultError::MathOverflow)?;

        emit!(UserSubscribed {
            user: position.user,
            strategy: position.strategy,
            initial_deposit,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Execute trade and update position
    /// Called by trader to record trade execution
    pub fn execute_trade(
        ctx: Context<ExecuteTrade>,
        amount: u64,
        profit_or_loss: i64,
    ) -> Result<()> {
        let position = &mut ctx.accounts.position;
        require!(position.is_active, VaultError::PositionInactive);

        // Update position balance
        if profit_or_loss >= 0 {
            position.current_balance = position.current_balance
                .checked_add(profit_or_loss as u64)
                .ok_or(VaultError::MathOverflow)?;
        } else {
            position.current_balance = position.current_balance
                .checked_sub(profit_or_loss.abs() as u64)
                .ok_or(VaultError::InsufficientBalance)?;
        }

        // Update strategy volume
        let strategy = &mut ctx.accounts.strategy;
        strategy.total_volume_traded = strategy.total_volume_traded
            .checked_add(amount)
            .ok_or(VaultError::MathOverflow)?;

        emit!(TradeExecuted {
            strategy: strategy.key(),
            user: position.user,
            amount,
            profit_or_loss,
            new_balance: position.current_balance,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Settle performance fees
    /// Calculate and transfer fees based on profit
    pub fn settle_fees(ctx: Context<SettleFees>) -> Result<()> {
        require!(ctx.accounts.position.is_active, VaultError::PositionInactive);

        // Calculate profit
        let profit = ctx.accounts.position.current_balance
            .checked_sub(ctx.accounts.position.initial_balance)
            .ok_or(VaultError::NoProfitToSettle)?;

        require!(profit > 0, VaultError::NoProfitToSettle);

        // Calculate fee: profit * performance_fee_bps / 10000
        let fee_amount = (profit as u128)
            .checked_mul(ctx.accounts.strategy.performance_fee_bps as u128)
            .ok_or(VaultError::MathOverflow)?
            .checked_div(BASIS_POINTS_DIVISOR as u128)
            .ok_or(VaultError::MathOverflow)? as u64;

        require!(fee_amount > 0, VaultError::FeeAmountTooSmall);

        // Prepare seeds for transfer
        let user_key = ctx.accounts.position.user;
        let strategy_key = ctx.accounts.position.strategy;
        let bump = ctx.accounts.position.bump;
        let position_seeds = &[
            b"position",
            user_key.as_ref(),
            strategy_key.as_ref(),
            &[bump],
        ];

        // Transfer fee from position to trader
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.position.to_account_info(),
                    to: ctx.accounts.trader.to_account_info(),
                },
                &[position_seeds],
            ),
            fee_amount,
        )?;

        // Update position
        let position = &mut ctx.accounts.position;
        position.current_balance = position.current_balance
            .checked_sub(fee_amount)
            .ok_or(VaultError::InsufficientBalance)?;
        position.initial_balance = position.current_balance; // Reset baseline
        position.total_fees_paid = position.total_fees_paid
            .checked_add(fee_amount)
            .ok_or(VaultError::MathOverflow)?;
        position.last_fee_settlement = Clock::get()?.unix_timestamp;

        // Update strategy stats
        let strategy = &mut ctx.accounts.strategy;
        strategy.total_fees_earned = strategy.total_fees_earned
            .checked_add(fee_amount)
            .ok_or(VaultError::MathOverflow)?;

        emit!(FeesSettled {
            user: user_key,
            strategy: strategy_key,
            trader: strategy.trader,
            fee_amount,
            remaining_balance: position.current_balance,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Unsubscribe from strategy and withdraw funds
    pub fn unsubscribe(ctx: Context<Unsubscribe>) -> Result<()> {
        require!(ctx.accounts.position.is_active, VaultError::PositionInactive);

        let withdraw_amount = ctx.accounts.position.current_balance;
        
        // Prepare seeds for transfer
        let user_key = ctx.accounts.position.user;
        let strategy_key = ctx.accounts.position.strategy;
        let bump = ctx.accounts.position.bump;
        let position_seeds = &[
            b"position",
            user_key.as_ref(),
            strategy_key.as_ref(),
            &[bump],
        ];

        // Transfer remaining balance back to user
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.position.to_account_info(),
                    to: ctx.accounts.user.to_account_info(),
                },
                &[position_seeds],
            ),
            withdraw_amount,
        )?;

        let position = &mut ctx.accounts.position;
        position.is_active = false;
        position.current_balance = 0;

        // Update strategy subscriber count
        let strategy = &mut ctx.accounts.strategy;
        strategy.total_subscribers = strategy.total_subscribers
            .checked_sub(1)
            .ok_or(VaultError::MathOverflow)?;

        emit!(UserUnsubscribed {
            user: user_key,
            strategy: strategy_key,
            withdrawn_amount: withdraw_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[account]
pub struct Strategy {
    pub trader: Pubkey,                // 32
    pub name: String,                  // 4 + 50
    pub description: String,           // 4 + 500
    pub performance_fee_bps: u16,      // 2
    pub total_subscribers: u32,        // 4
    pub total_volume_traded: u64,      // 8
    pub total_fees_earned: u64,        // 8
    pub is_active: bool,               // 1
    pub created_at: i64,               // 8
    pub bump: u8,                      // 1
}

impl Strategy {
    pub const LEN: usize = 8 + 32 + 54 + 504 + 2 + 4 + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,                  // 32
    pub strategy: Pubkey,              // 32
    pub initial_balance: u64,          // 8
    pub current_balance: u64,          // 8
    pub total_fees_paid: u64,          // 8
    pub last_fee_settlement: i64,      // 8
    pub subscribed_at: i64,            // 8
    pub is_active: bool,               // 1
    pub bump: u8,                      // 1
}

impl UserPosition {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
}

// ============================================================================
// Context Structures
// ============================================================================

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeStrategy<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,
    
    #[account(
        init,
        payer = trader,
        space = Strategy::LEN,
        seeds = [b"strategy", trader.key().as_ref()],
        bump
    )]
    pub strategy: Account<'info, Strategy>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateStrategy<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"strategy", trader.key().as_ref()],
        bump = strategy.bump,
        has_one = trader
    )]
    pub strategy: Account<'info, Strategy>,
}

#[derive(Accounts)]
pub struct SubscribeToStrategy<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"strategy", strategy.trader.as_ref()],
        bump = strategy.bump
    )]
    pub strategy: Account<'info, Strategy>,
    
    #[account(
        init,
        payer = user,
        space = UserPosition::LEN,
        seeds = [b"position", user.key().as_ref(), strategy.key().as_ref()],
        bump
    )]
    pub position: Account<'info, UserPosition>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteTrade<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"strategy", trader.key().as_ref()],
        bump = strategy.bump,
        has_one = trader
    )]
    pub strategy: Account<'info, Strategy>,
    
    #[account(
        mut,
        seeds = [b"position", position.user.as_ref(), strategy.key().as_ref()],
        bump = position.bump,
        has_one = strategy
    )]
    pub position: Account<'info, UserPosition>,
}

#[derive(Accounts)]
pub struct SettleFees<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: Trader receiving fees
    #[account(mut)]
    pub trader: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"strategy", strategy.trader.as_ref()],
        bump = strategy.bump,
        has_one = trader
    )]
    pub strategy: Account<'info, Strategy>,
    
    #[account(
        mut,
        seeds = [b"position", user.key().as_ref(), strategy.key().as_ref()],
        bump = position.bump,
        has_one = user,
        has_one = strategy
    )]
    pub position: Account<'info, UserPosition>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unsubscribe<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"strategy", strategy.trader.as_ref()],
        bump = strategy.bump
    )]
    pub strategy: Account<'info, Strategy>,
    
    #[account(
        mut,
        seeds = [b"position", user.key().as_ref(), strategy.key().as_ref()],
        bump = position.bump,
        has_one = user,
        has_one = strategy
    )]
    pub position: Account<'info, UserPosition>,
    
    pub system_program: Program<'info, System>,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct StrategyCreated {
    pub strategy: Pubkey,
    pub trader: Pubkey,
    pub name: String,
    pub performance_fee_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct StrategyUpdated {
    pub strategy: Pubkey,
    pub trader: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct UserSubscribed {
    pub user: Pubkey,
    pub strategy: Pubkey,
    pub initial_deposit: u64,
    pub timestamp: i64,
}

#[event]
pub struct TradeExecuted {
    pub strategy: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub profit_or_loss: i64,
    pub new_balance: u64,
    pub timestamp: i64,
}

#[event]
pub struct FeesSettled {
    pub user: Pubkey,
    pub strategy: Pubkey,
    pub trader: Pubkey,
    pub fee_amount: u64,
    pub remaining_balance: u64,
    pub timestamp: i64,
}

#[event]
pub struct UserUnsubscribed {
    pub user: Pubkey,
    pub strategy: Pubkey,
    pub withdrawn_amount: u64,
    pub timestamp: i64,
}

// ============================================================================
// Error Codes
// ============================================================================

#[error_code]
pub enum VaultError {
    #[msg("Strategy name is too long (max 50 characters)")]
    NameTooLong,
    
    #[msg("Description is too long (max 500 characters)")]
    DescriptionTooLong,
    
    #[msg("Performance fee is too high (max 50%)")]
    FeeTooHigh,
    
    #[msg("Strategy is not active")]
    StrategyInactive,
    
    #[msg("Insufficient deposit amount (minimum 1 SOL)")]
    InsufficientDeposit,
    
    #[msg("Position is not active")]
    PositionInactive,
    
    #[msg("Insufficient balance for operation")]
    InsufficientBalance,
    
    #[msg("No profit available to settle fees")]
    NoProfitToSettle,
    
    #[msg("Fee amount too small")]
    FeeAmountTooSmall,
    
    #[msg("Math operation overflow")]
    MathOverflow,
}
