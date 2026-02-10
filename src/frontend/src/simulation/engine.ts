import { Position, ScenarioConfig, SimulationResult, ScenarioStepResult } from './types';

export function runSimulation(
  positions: Position[],
  config: ScenarioConfig
): SimulationResult {
  const steps: ScenarioStepResult[] = [];
  const startTime = Date.now();

  // Calculate initial values
  let depositPositions = positions.filter((p) => p.positionType === 'deposit');
  let borrowPositions = positions.filter((p) => p.positionType === 'borrow');

  // Apply price shock to asset prices
  const shockedPositions = positions.map((p) => ({
    ...p,
    asset: {
      ...p.asset,
      priceUSD: p.asset.priceUSD * (1 + config.priceShockPct / 100),
    },
  }));

  depositPositions = shockedPositions.filter((p) => p.positionType === 'deposit');
  borrowPositions = shockedPositions.filter((p) => p.positionType === 'borrow');

  // Simulate each day
  for (let day = 0; day <= config.timeframeDays; day++) {
    const dayFraction = day / 365;

    // Calculate deposit values with accrued interest
    const depositValue = depositPositions.reduce((sum, pos) => {
      const principal = pos.amount * pos.asset.priceUSD;
      const interest = principal * pos.asset.interestRate * dayFraction;
      return sum + principal + interest;
    }, 0);

    // Calculate borrow values with accrued interest
    const borrowValue = borrowPositions.reduce((sum, pos) => {
      const principal = pos.amount * pos.asset.priceUSD;
      const interest = principal * pos.asset.interestRate * dayFraction;
      return sum + principal + interest;
    }, 0);

    const netValue = depositValue - borrowValue;

    // Calculate health factor
    const collateralValue = depositPositions.reduce((sum, pos) => {
      const value = pos.amount * pos.asset.priceUSD;
      const interest = value * pos.asset.interestRate * dayFraction;
      return sum + (value + interest) * pos.asset.liquidationThreshold;
    }, 0);

    const healthFactor = borrowValue > 0 ? collateralValue / borrowValue : 999;

    // Calculate interest accrued this day
    const depositInterest = depositPositions.reduce(
      (sum, pos) => sum + pos.amount * pos.asset.priceUSD * pos.asset.interestRate / 365,
      0
    );
    const borrowInterest = borrowPositions.reduce(
      (sum, pos) => sum + pos.amount * pos.asset.priceUSD * pos.asset.interestRate / 365,
      0
    );
    const interestAccrued = depositInterest - borrowInterest;

    steps.push({
      day,
      timestamp: startTime + day * 24 * 60 * 60 * 1000,
      depositValue,
      borrowValue,
      netValue,
      interestAccrued,
      healthFactor,
    });
  }

  const finalStep = steps[steps.length - 1];
  const totalDeposits = finalStep.depositValue;
  const totalBorrows = finalStep.borrowValue;

  // Calculate liquidation price (simplified)
  const avgLiqThreshold =
    depositPositions.reduce((sum, pos) => sum + pos.asset.liquidationThreshold, 0) /
    Math.max(depositPositions.length, 1);
  const liquidationPrice = totalBorrows > 0 ? totalBorrows / (totalDeposits * avgLiqThreshold) : 0;

  return {
    steps,
    finalTotals: {
      totalDeposits,
      totalBorrows,
      netValue: finalStep.netValue,
      healthFactor: finalStep.healthFactor,
      liquidationPrice,
    },
  };
}
