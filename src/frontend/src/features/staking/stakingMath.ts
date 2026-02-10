/**
 * Pure helper functions for staking calculations
 * All functions are deterministic and return stable results for the same inputs
 */

export type CompoundingFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Calculate simple staking rewards (no compounding)
 * @param principal - Initial staking amount
 * @param apr - Annual percentage rate (as percentage, e.g., 12 for 12%)
 * @param days - Number of days staked
 * @returns Rewards earned
 */
export function calculateSimpleRewards(
  principal: number,
  apr: number,
  days: number
): number {
  if (principal <= 0 || apr < 0 || days <= 0) return 0;
  
  const dailyRate = apr / 100 / 365;
  return principal * dailyRate * days;
}

/**
 * Calculate compounded staking rewards
 * @param principal - Initial staking amount
 * @param apr - Annual percentage rate (as percentage, e.g., 12 for 12%)
 * @param days - Number of days staked
 * @param frequency - Compounding frequency
 * @returns Object with rewards earned and final balance
 */
export function calculateCompoundedRewards(
  principal: number,
  apr: number,
  days: number,
  frequency: CompoundingFrequency
): {
  rewards: number;
  finalBalance: number;
  effectiveApy: number;
} {
  if (principal <= 0 || apr < 0 || days <= 0) {
    return { rewards: 0, finalBalance: principal, effectiveApy: 0 };
  }

  // No compounding - use simple interest
  if (frequency === 'none') {
    const rewards = calculateSimpleRewards(principal, apr, days);
    return {
      rewards,
      finalBalance: principal + rewards,
      effectiveApy: apr, // APY = APR when no compounding
    };
  }

  // Determine compounding periods per year
  const periodsPerYear = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    yearly: 1,
  }[frequency];

  // Calculate number of compounding periods in the timeframe
  const totalPeriods = (days / 365) * periodsPerYear;
  
  // Compound interest formula: A = P(1 + r/n)^(nt)
  // where r = annual rate, n = periods per year, t = time in years
  const ratePerPeriod = apr / 100 / periodsPerYear;
  const finalBalance = principal * Math.pow(1 + ratePerPeriod, totalPeriods);
  const rewards = finalBalance - principal;
  
  // Calculate effective APY for full year
  const effectiveApy = (Math.pow(1 + ratePerPeriod, periodsPerYear) - 1) * 100;

  return {
    rewards,
    finalBalance,
    effectiveApy,
  };
}

/**
 * Calculate rewards with lockup period consideration
 * @param principal - Initial staking amount
 * @param apr - Annual percentage rate
 * @param stakingDays - Total staking period
 * @param lockupDays - Lockup period (no withdrawals)
 * @param frequency - Compounding frequency
 * @returns Calculation results with lockup info
 */
export function calculateWithLockup(
  principal: number,
  apr: number,
  stakingDays: number,
  lockupDays: number,
  frequency: CompoundingFrequency
): {
  rewards: number;
  finalBalance: number;
  effectiveApy: number;
  isLocked: boolean;
  daysUntilUnlock: number;
} {
  const results = calculateCompoundedRewards(principal, apr, stakingDays, frequency);
  
  return {
    ...results,
    isLocked: stakingDays < lockupDays,
    daysUntilUnlock: Math.max(0, lockupDays - stakingDays),
  };
}

/**
 * Compare different compounding frequencies
 * @param principal - Initial staking amount
 * @param apr - Annual percentage rate
 * @param days - Number of days
 * @returns Comparison of all frequencies
 */
export function compareCompoundingFrequencies(
  principal: number,
  apr: number,
  days: number
): Record<CompoundingFrequency, { rewards: number; finalBalance: number; effectiveApy: number }> {
  const frequencies: CompoundingFrequency[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
  
  const results: any = {};
  frequencies.forEach((freq) => {
    results[freq] = calculateCompoundedRewards(principal, apr, days, freq);
  });
  
  return results;
}
