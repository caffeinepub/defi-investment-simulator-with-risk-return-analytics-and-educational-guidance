import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';
import { calculateLpVsHold, calculateNetWithFees, estimateFeesEarned, CompoundingFrequency } from './lpMath';

export function LpCalculatorView() {
  const [initialPrice, setInitialPrice] = useState<string>('100');
  const [finalPrice, setFinalPrice] = useState<string>('150');
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [feeApr, setFeeApr] = useState<string>('25');
  const [timeframeDays, setTimeframeDays] = useState<string>('30');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('none');

  const initialPriceNum = parseFloat(initialPrice) || 0;
  const finalPriceNum = parseFloat(finalPrice) || 0;
  const depositAmountNum = parseFloat(depositAmount) || 0;
  const feeAprNum = parseFloat(feeApr) || 0;
  const timeframeDaysNum = parseInt(timeframeDays) || 0;

  // Calculate token amount for 50/50 pool
  const tokenAmount = initialPriceNum > 0 ? depositAmountNum / initialPriceNum / 2 : 0;
  const totalInitialValue = depositAmountNum;

  const results = calculateLpVsHold(initialPriceNum, finalPriceNum, tokenAmount);
  const feesEarned = estimateFeesEarned(totalInitialValue, feeAprNum, timeframeDaysNum, compoundingFrequency);
  const netResults = calculateNetWithFees(results.lpValue, results.holdValue, feesEarned);

  const priceChangePercent = initialPriceNum > 0 
    ? ((finalPriceNum - initialPriceNum) / initialPriceNum) * 100 
    : 0;

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">LP Calculator</CardTitle>
          <CardDescription className="text-base">
            Estimate impermanent loss and LP outcomes for a 50/50 liquidity pool with compounding options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="initial-price">Initial Token Price ($)</Label>
              <Input
                id="initial-price"
                type="number"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="final-price">Final Token Price ($)</Label>
              <Input
                id="final-price"
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Total Deposit Value ($)</Label>
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0"
                step="1"
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                Total value for 50/50 pool (both sides)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee-apr">Fee APR (%)</Label>
              <Input
                id="fee-apr"
                type="number"
                value={feeApr}
                onChange={(e) => setFeeApr(e.target.value)}
                min="0"
                step="0.1"
                placeholder="25"
              />
              <p className="text-xs text-muted-foreground">
                Annual percentage rate from trading fees
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (days)</Label>
              <Input
                id="timeframe"
                type="number"
                value={timeframeDays}
                onChange={(e) => setTimeframeDays(e.target.value)}
                min="1"
                step="1"
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compounding">Compounding Frequency</Label>
              <Select value={compoundingFrequency} onValueChange={(v) => setCompoundingFrequency(v as CompoundingFrequency)}>
                <SelectTrigger id="compounding">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Simple Interest)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often fees are reinvested
              </p>
            </div>
          </div>

          {/* Price Change Summary */}
          <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Price Change Summary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ${initialPriceNum.toFixed(2)} → ${finalPriceNum.toFixed(2)}
              </span>
              <span className={`text-lg font-semibold flex items-center gap-1 ${priceChangePercent >= 0 ? 'text-foreground' : 'text-foreground'}`}>
                {priceChangePercent >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Results</CardTitle>
          <CardDescription>
            Comparison of LP position vs holding assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
              <div className="text-sm text-muted-foreground mb-2">LP Position Value</div>
              <div className="text-3xl font-bold">${results.lpValue.toFixed(2)}</div>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
              <div className="text-sm text-muted-foreground mb-2">Hold Value</div>
              <div className="text-3xl font-bold">${results.holdValue.toFixed(2)}</div>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
              <div className="text-sm text-muted-foreground mb-2">
                Fees Earned {compoundingFrequency !== 'none' && `(${compoundingFrequency})`}
              </div>
              <div className="text-3xl font-bold">${feesEarned.toFixed(2)}</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Initial Deposit</TableCell>
                <TableCell className="text-right">${totalInitialValue.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Impermanent Loss</TableCell>
                <TableCell className="text-right">
                  <span className={results.impermanentLoss < 0 ? 'text-destructive' : 'text-foreground'}>
                    ${results.impermanentLoss.toFixed(2)} ({results.impermanentLossPercent.toFixed(2)}%)
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Trading Fees Earned</TableCell>
                <TableCell className="text-right text-foreground">
                  +${feesEarned.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LP Final Value (with fees)</TableCell>
                <TableCell className="text-right font-semibold">
                  ${(results.lpValue + feesEarned).toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Hold Final Value</TableCell>
                <TableCell className="text-right font-semibold">
                  ${results.holdValue.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Net Difference (LP vs Hold)</TableCell>
                <TableCell className="text-right">
                  <span className={`font-bold text-lg ${netResults.isProfitable ? 'text-foreground' : 'text-destructive'}`}>
                    {netResults.netDifference >= 0 ? '+' : ''}${netResults.netDifference.toFixed(2)}
                    {' '}({netResults.netDifferencePercent >= 0 ? '+' : ''}{netResults.netDifferencePercent.toFixed(2)}%)
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Outcome Alert */}
          {netResults.isProfitable ? (
            <Alert className="border-foreground/20 bg-muted/30">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>LP is profitable!</strong> The trading fees {compoundingFrequency !== 'none' && `(compounded ${compoundingFrequency}) `}
                more than compensate for impermanent loss. You would earn ${netResults.netDifference.toFixed(2)} more by providing liquidity.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                <strong>Impermanent loss exceeds fees.</strong> You would lose ${Math.abs(netResults.netDifference).toFixed(2)} compared to holding. 
                Consider {compoundingFrequency === 'none' ? 'enabling compounding or ' : ''}waiting for higher fee APR or smaller price changes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
