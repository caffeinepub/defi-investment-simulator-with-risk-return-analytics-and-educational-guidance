import { Asset, PositionType } from '../backend';

export interface Position {
  id: string;
  asset: Asset;
  positionType: PositionType;
  amount: number;
  createdAt: number;
}

export interface ScenarioConfig {
  timeframeDays: number;
  priceShockPct: number;
}

export interface ScenarioStepResult {
  day: number;
  timestamp: number;
  depositValue: number;
  borrowValue: number;
  netValue: number;
  interestAccrued: number;
  healthFactor: number;
}

export interface SimulationResult {
  steps: ScenarioStepResult[];
  finalTotals: {
    totalDeposits: number;
    totalBorrows: number;
    netValue: number;
    healthFactor: number;
    liquidationPrice: number;
  };
}

export interface RiskResult {
  healthFactor: number;
  collateralRatio: number;
  liquidationThreshold: number;
  liquidationPrice: number;
  riskLevel: 'Safe' | 'At Risk' | 'Liquidation';
  priceSensitivity: number;
}

export interface ReturnResult {
  totalDepositInterest: number;
  totalBorrowInterest: number;
  netReturn: number;
  apr: number;
  apy: number;
  breakdown: {
    deposits: Array<{ asset: string; interest: number }>;
    borrows: Array<{ asset: string; interest: number }>;
  };
}
