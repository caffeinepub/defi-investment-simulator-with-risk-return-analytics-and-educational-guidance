import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { useSimulatorState } from '../../state/useSimulatorState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function RiskMetricsView() {
  const { positions, priceShockPct, riskResult, setPriceShock } = useSimulatorState();

  const getRiskBadge = () => {
    if (!riskResult) return null;

    const variants = {
      Safe: 'default' as const,
      'At Risk': 'secondary' as const,
      Liquidation: 'destructive' as const,
    };

    const icons = {
      Safe: <Shield className="h-3 w-3" />,
      'At Risk': <AlertCircle className="h-3 w-3" />,
      Liquidation: <AlertTriangle className="h-3 w-3" />,
    };

    return (
      <Badge variant={variants[riskResult.riskLevel]} className="flex items-center gap-1">
        {icons[riskResult.riskLevel]}
        {riskResult.riskLevel}
      </Badge>
    );
  };

  const handleSliderChange = (value: number[]) => {
    // Safely extract numeric value from array
    const newValue = Array.isArray(value) && value.length > 0 ? value[0] : 0;
    setPriceShock(newValue);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Risk & Liquidation Metrics</CardTitle>
          <CardDescription className="text-base">
            Analyze the risk profile of your DeFi strategy and test price shock scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Add positions in the Strategy Builder to see risk metrics
            </div>
          ) : !riskResult ? (
            <div className="text-center py-12 text-muted-foreground">
              Run a simulation to calculate risk metrics
            </div>
          ) : (
            <div className="space-y-8">
              {/* Risk Level */}
              <div className="flex items-center justify-between p-6 bg-muted/50 rounded-xl border border-border/50">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Overall Risk Level</div>
                  <div className="text-3xl font-bold">Risk Assessment</div>
                </div>
                {getRiskBadge()}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-6 border border-border/50 rounded-xl cursor-help hover:border-border transition-colors shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2">Health Factor</div>
                        <div className="text-4xl font-bold">
                          {riskResult.healthFactor > 99
                            ? '∞'
                            : riskResult.healthFactor.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {riskResult.healthFactor < 1.0
                            ? 'Below liquidation threshold'
                            : riskResult.healthFactor < 1.5
                              ? 'Low safety margin'
                              : 'Healthy position'}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Health factor represents the safety of your position. Below 1.0 means
                        liquidation. Above 2.0 is recommended for safety.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-6 border border-border/50 rounded-xl cursor-help hover:border-border transition-colors shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2">Collateral Ratio</div>
                        <div className="text-4xl font-bold">
                          {riskResult.collateralRatio > 99
                            ? '∞'
                            : riskResult.collateralRatio.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Deposits / Borrows
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The ratio of your total deposits to total borrows. Higher is safer.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-6 border border-border/50 rounded-xl cursor-help hover:border-border transition-colors shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2">
                          Liquidation Threshold
                        </div>
                        <div className="text-4xl font-bold">
                          {(riskResult.liquidationThreshold * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Average across assets
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The percentage of collateral value that can be borrowed before liquidation.
                        Varies by asset.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-6 border border-border/50 rounded-xl cursor-help hover:border-border transition-colors shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2">Liquidation Price</div>
                        <div className="text-4xl font-bold">
                          {riskResult.liquidationPrice.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Estimated threshold
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Simplified estimate of the price level that would trigger liquidation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Shock Simulator */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Price Shock Sensitivity</CardTitle>
          <CardDescription className="text-base">
            Test how your portfolio responds to price changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="price-shock" className="text-base">Price Change</Label>
              <span className="text-lg font-semibold">
                {priceShockPct > 0 ? '+' : ''}
                {priceShockPct.toFixed(0)}%
              </span>
            </div>
            <Slider
              id="price-shock"
              min={-50}
              max={50}
              step={1}
              value={[priceShockPct]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>-50% (Crash)</span>
              <span>0% (Current)</span>
              <span>+50% (Rally)</span>
            </div>
          </div>

          {riskResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                <div className="text-sm text-muted-foreground mb-2">
                  Health Factor @ {priceShockPct > 0 ? '+' : ''}
                  {priceShockPct}%
                </div>
                <div className="text-3xl font-bold">
                  {riskResult.healthFactor > 99 ? '∞' : riskResult.healthFactor.toFixed(2)}
                </div>
              </div>
              <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                <div className="text-sm text-muted-foreground mb-2">Risk Level</div>
                <div className="text-3xl font-bold">{riskResult.riskLevel}</div>
              </div>
              <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                <div className="text-sm text-muted-foreground mb-2">Price Sensitivity</div>
                <div className="text-3xl font-bold">
                  {riskResult.priceSensitivity.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">per 1% price change</div>
              </div>
            </div>
          )}

          <div className="p-6 bg-muted/50 rounded-xl text-sm border border-border/50">
            <p className="text-muted-foreground leading-relaxed">
              <strong>How to use:</strong> Adjust the slider to simulate price changes in your
              collateral assets. Watch how your health factor and risk level change. This helps you
              understand your liquidation risk under different market conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
