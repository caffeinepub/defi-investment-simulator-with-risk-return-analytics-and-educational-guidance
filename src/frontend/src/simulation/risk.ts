import { Position, RiskResult } from './types';

export function calculateRiskMetrics(
  positions: Position[],
  priceShockPct: number
): RiskResult {
  // Apply price shock
  const shockedPositions = positions.map((p) => ({
    ...p,
    asset: {
      ...p.asset,
      priceUSD: p.asset.priceUSD * (1 + priceShockPct / 100),
    },
  }));

  const depositPositions = shockedPositions.filter((p) => p.positionType === 'deposit');
  const borrowPositions = shockedPositions.filter((p) => p.positionType === 'borrow');

  // Calculate total values
  const totalDepositValue = depositPositions.reduce(
    (sum, pos) => sum + pos.amount * pos.asset.priceUSD,
    0
  );
  const totalBorrowValue = borrowPositions.reduce(
    (sum, pos) => sum + pos.amount * pos.asset.priceUSD,
    0
  );

  // Calculate collateral value (adjusted by liquidation threshold)
  const collateralValue = depositPositions.reduce(
    (sum, pos) => sum + pos.amount * pos.asset.priceUSD * pos.asset.liquidationThreshold,
    0
  );

  // Calculate metrics
  const collateralRatio = totalBorrowValue > 0 ? totalDepositValue / totalBorrowValue : 999;
  const healthFactor = totalBorrowValue > 0 ? collateralValue / totalBorrowValue : 999;

  // Average liquidation threshold
  const avgLiqThreshold =
    depositPositions.reduce((sum, pos) => sum + pos.asset.liquidationThreshold, 0) /
    Math.max(depositPositions.length, 1);

  // Liquidation price (price drop % that would trigger liquidation)
  const liquidationPrice =
    totalBorrowValue > 0 ? totalBorrowValue / (totalDepositValue * avgLiqThreshold) : 0;

  // Risk level
  let riskLevel: 'Safe' | 'At Risk' | 'Liquidation';
  if (healthFactor < 1.0) {
    riskLevel = 'Liquidation';
  } else if (healthFactor < 1.5) {
    riskLevel = 'At Risk';
  } else {
    riskLevel = 'Safe';
  }

  // Price sensitivity (how much health factor changes per 1% price change)
  const priceSensitivity = totalBorrowValue > 0 ? collateralValue / totalBorrowValue / 100 : 0;

  return {
    healthFactor,
    collateralRatio,
    liquidationThreshold: avgLiqThreshold,
    liquidationPrice,
    riskLevel,
    priceSensitivity,
  };
}
