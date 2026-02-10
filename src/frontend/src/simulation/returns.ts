import { Position, ReturnResult } from './types';

export function calculateReturns(positions: Position[], timeframeDays: number): ReturnResult {
  const depositPositions = positions.filter((p) => p.positionType === 'deposit');
  const borrowPositions = positions.filter((p) => p.positionType === 'borrow');

  const yearFraction = timeframeDays / 365;

  // Calculate deposit interest
  const depositBreakdown = depositPositions.map((pos) => {
    const principal = pos.amount * pos.asset.priceUSD;
    const interest = principal * pos.asset.interestRate * yearFraction;
    return {
      asset: pos.asset.symbol,
      interest,
    };
  });

  const totalDepositInterest = depositBreakdown.reduce((sum, item) => sum + item.interest, 0);

  // Calculate borrow interest (cost)
  const borrowBreakdown = borrowPositions.map((pos) => {
    const principal = pos.amount * pos.asset.priceUSD;
    const interest = principal * pos.asset.interestRate * yearFraction;
    return {
      asset: pos.asset.symbol,
      interest,
    };
  });

  const totalBorrowInterest = borrowBreakdown.reduce((sum, item) => sum + item.interest, 0);

  // Net return
  const netReturn = totalDepositInterest - totalBorrowInterest;

  // Calculate total principal
  const totalPrincipal =
    depositPositions.reduce((sum, pos) => sum + pos.amount * pos.asset.priceUSD, 0) -
    borrowPositions.reduce((sum, pos) => sum + pos.amount * pos.asset.priceUSD, 0);

  // APR (simple interest)
  const apr = totalPrincipal > 0 ? (netReturn / totalPrincipal / yearFraction) * 100 : 0;

  // APY (compound interest, assuming daily compounding)
  const dailyRate = totalPrincipal > 0 ? netReturn / totalPrincipal / timeframeDays : 0;
  const apy = totalPrincipal > 0 ? (Math.pow(1 + dailyRate, 365) - 1) * 100 : 0;

  return {
    totalDepositInterest,
    totalBorrowInterest,
    netReturn,
    apr,
    apy,
    breakdown: {
      deposits: depositBreakdown,
      borrows: borrowBreakdown,
    },
  };
}
