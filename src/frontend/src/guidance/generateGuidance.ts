import { RiskResult, ReturnResult } from '../simulation/types';

export interface GuidanceContent {
  riskAnalysis: string;
  parameterSuggestions: string[];
  keyInsights: string[];
}

export function generateGuidance(
  riskResult: RiskResult | null,
  returnResult: ReturnResult | null
): GuidanceContent {
  const suggestions: string[] = [];
  const insights: string[] = [];
  let riskAnalysis = '';

  if (!riskResult || !returnResult) {
    return {
      riskAnalysis: 'Run a simulation to see personalized guidance based on your strategy.',
      parameterSuggestions: [],
      keyInsights: [],
    };
  }

  // Risk analysis
  if (riskResult.riskLevel === 'Liquidation') {
    riskAnalysis =
      '⚠️ Critical Risk: Your position is at or below the liquidation threshold. Immediate action is required to avoid liquidation.';
    suggestions.push('Add more collateral to increase your health factor above 1.0');
    suggestions.push('Reduce your borrow amount to lower liquidation risk');
    suggestions.push('Consider closing risky positions and rebalancing your portfolio');
  } else if (riskResult.riskLevel === 'At Risk') {
    riskAnalysis =
      '⚠️ Elevated Risk: Your health factor is below 1.5, which means you are vulnerable to liquidation if asset prices move against you.';
    suggestions.push('Increase collateral to improve your health factor to at least 2.0');
    suggestions.push('Monitor price movements closely and be prepared to adjust positions');
    suggestions.push('Consider reducing leverage to create a safety buffer');
  } else {
    riskAnalysis =
      '✓ Safe Position: Your health factor is healthy, indicating good collateralization. Continue monitoring market conditions.';
    insights.push('Your current collateral ratio provides a good safety margin');
  }

  // Return analysis
  if (returnResult.netReturn < 0) {
    insights.push(
      `Your borrow costs (${returnResult.totalBorrowInterest.toFixed(2)} USD) exceed deposit earnings (${returnResult.totalDepositInterest.toFixed(2)} USD)`
    );
    suggestions.push('Review if your borrowing strategy is generating sufficient returns elsewhere');
    suggestions.push('Consider reducing borrow amounts or finding higher-yield deposit opportunities');
  } else {
    insights.push(
      `Your strategy generates a net positive return of ${returnResult.netReturn.toFixed(2)} USD over the simulation period`
    );
    insights.push(`Annualized APR: ${returnResult.apr.toFixed(2)}%, APY: ${returnResult.apy.toFixed(2)}%`);
  }

  // Health factor specific guidance
  if (riskResult.healthFactor < 2.0 && riskResult.healthFactor >= 1.0) {
    suggestions.push(
      `Your health factor is ${riskResult.healthFactor.toFixed(2)}. Aim for at least 2.0 for better safety`
    );
  }

  // Price sensitivity
  if (riskResult.priceSensitivity > 0) {
    insights.push(
      `A 10% price drop would reduce your health factor by approximately ${(riskResult.priceSensitivity * 10).toFixed(2)}`
    );
  }

  return {
    riskAnalysis,
    parameterSuggestions: suggestions,
    keyInsights: insights,
  };
}
