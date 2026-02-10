/**
 * Pure helper functions for LP (Liquidity Pool) calculations
 * All functions are deterministic and return stable results for the same inputs
 */

export type CompoundingFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * Calculate impermanent loss percentage for a 50/50 pool
 * @param priceRatio - Final price / Initial price (e.g., 2.0 means price doubled)
 * @returns Impermanent loss as a percentage (negative value)
 */
export function calculateImpermanentLoss(priceRatio: number): number {
  if (priceRatio <= 0 || !isFinite(priceRatio)) return 0;
  
  // IL formula: 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
  const il = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  return il * 100; // Convert to percentage
}

/**
 * Calculate LP value compared to holding
 * @param initialPrice - Initial token price
 * @param finalPrice - Final token price
 * @param initialTokenAmount - Initial amount of tokens deposited (for 50/50 pool, this is per token)
 * @returns Object with LP value, hold value, and IL percentage
 */
export function calculateLpVsHold(
  initialPrice: number,
  finalPrice: number,
  initialTokenAmount: number
): {
  lpValue: number;
  holdValue: number;
  impermanentLoss: number;
  impermanentLossPercent: number;
} {
  // Validate inputs
  if (initialPrice <= 0 || finalPrice <= 0 || initialTokenAmount <= 0) {
    return { lpValue: 0, holdValue: 0, impermanentLoss: 0, impermanentLossPercent: 0 };
  }

  const priceRatio = finalPrice / initialPrice;
  
  // For a 50/50 pool with initial value V0 split equally:
  // Initial: V0/2 in token A, V0/2 in token B (stablecoin)
  // If we deposit initialTokenAmount of token A at initialPrice:
  const initialValuePerToken = initialTokenAmount * initialPrice;
  const totalInitialValue = initialValuePerToken * 2; // 50/50 split
  
  // LP value after price change (constant product formula)
  // k = x * y (constant)
  // Initial: x0 * y0 = k
  // After price change: x1 * y1 = k, where y1/x1 = finalPrice
  // LP value = 2 * sqrt(k * finalPrice)
  const k = initialTokenAmount * initialValuePerToken; // x0 * y0
  const lpValue = 2 * Math.sqrt(k * finalPrice);
  
  // Hold value (if we just held the tokens)
  const holdValue = initialTokenAmount * finalPrice + initialValuePerToken;
  
  // Impermanent loss
  const impermanentLoss = lpValue - holdValue;
  const impermanentLossPercent = (impermanentLoss / holdValue) * 100;
  
  return {
    lpValue,
    holdValue,
    impermanentLoss,
    impermanentLossPercent,
  };
}

/**
 * Calculate net outcome including fees
 * @param lpValue - LP position value
 * @param holdValue - Hold value
 * @param feesEarned - Total fees earned over the period
 * @returns Net difference including fees
 */
export function calculateNetWithFees(
  lpValue: number,
  holdValue: number,
  feesEarned: number
): {
  netDifference: number;
  netDifferencePercent: number;
  isProfitable: boolean;
} {
  const netDifference = lpValue + feesEarned - holdValue;
  const netDifferencePercent = (netDifference / holdValue) * 100;
  
  return {
    netDifference,
    netDifferencePercent,
    isProfitable: netDifference >= 0,
  };
}

/**
 * Estimate fees earned based on APR and timeframe with optional compounding
 * @param liquidityValue - Total liquidity provided
 * @param feeApr - Annual fee APR as percentage (e.g., 25 for 25%)
 * @param days - Number of days
 * @param compoundingFrequency - How often to compound (none, daily, weekly, monthly)
 * @returns Estimated fees earned
 */
export function estimateFeesEarned(
  liquidityValue: number,
  feeApr: number,
  days: number,
  compoundingFrequency: CompoundingFrequency = 'none'
): number {
  if (liquidityValue <= 0 || feeApr < 0 || days <= 0) return 0;
  
  const annualRate = feeApr / 100;
  
  // Simple interest (no compounding)
  if (compoundingFrequency === 'none') {
    const dailyRate = annualRate / 365;
    return liquidityValue * dailyRate * days;
  }
  
  // Compounding
  let periodsPerYear: number;
  switch (compoundingFrequency) {
    case 'daily':
      periodsPerYear = 365;
      break;
    case 'weekly':
      periodsPerYear = 52;
      break;
    case 'monthly':
      periodsPerYear = 12;
      break;
    default:
      periodsPerYear = 365;
  }
  
  const ratePerPeriod = annualRate / periodsPerYear;
  const periodsElapsed = (days / 365) * periodsPerYear;
  
  // Compound interest formula: A = P(1 + r)^n - P
  const finalValue = liquidityValue * Math.pow(1 + ratePerPeriod, periodsElapsed);
  return finalValue - liquidityValue;
}
