import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Info, Lock } from 'lucide-react';
import { calculateWithLockup, compareCompoundingFrequencies, CompoundingFrequency } from './stakingMath';

export function StakingCalculatorView() {
  const [principal, setPrincipal] = useState<string>('10000');
  const [apr, setApr] = useState<string>('12');
  const [days, setDays] = useState<string>('365');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('daily');
  const [lockupDays, setLockupDays] = useState<string>('0');

  const principalNum = parseFloat(principal) || 0;
  const aprNum = parseFloat(apr) || 0;
  const daysNum = parseInt(days) || 0;
  const lockupDaysNum = parseInt(lockupDays) || 0;

  const results = calculateWithLockup(principalNum, aprNum, daysNum, lockupDaysNum, frequency);
  const comparison = compareCompoundingFrequencies(principalNum, aprNum, daysNum);

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Staking Calculator</CardTitle>
          <CardDescription className="text-base">
            Estimate staking rewards and compounding outcomes over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount ($)</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                min="0"
                step="1"
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apr">APR (%)</Label>
              <Input
                id="apr"
                type="number"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                min="0"
                step="0.1"
                placeholder="12"
              />
              <p className="text-xs text-muted-foreground">
                Annual percentage rate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Staking Period (Days)</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                step="1"
                placeholder="365"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Compounding Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as CompoundingFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Simple Interest)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockup">Lockup Period (Days)</Label>
              <Input
                id="lockup"
                type="number"
                value={lockupDays}
                onChange={(e) => setLockupDays(e.target.value)}
                min="0"
                step="1"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Optional - no withdrawals during lockup
              </p>
            </div>
          </div>

          {/* Lockup Warning */}
          {lockupDaysNum > 0 && results.isLocked && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Lockup Active:</strong> Your funds would be locked for {results.daysUntilUnlock} more days.
                No withdrawals are modeled during the lockup period.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {principalNum > 0 && aprNum > 0 && daysNum > 0 && (
        <>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Initial Stake</div>
                  <div className="text-3xl font-bold">${principalNum.toFixed(2)}</div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Rewards Earned
                  </div>
                  <div className="text-3xl font-bold text-chart-2">
                    ${results.rewards.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Over {daysNum} days
                  </div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Final Balance</div>
                  <div className="text-3xl font-bold">${results.finalBalance.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    +{((results.finalBalance / principalNum - 1) * 100).toFixed(2)}% gain
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-muted/50 rounded-xl border border-border/50">
                <div className="text-sm text-muted-foreground mb-2">Effective APY</div>
                <div className="text-4xl font-bold">{results.effectiveApy.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground mt-2">
                  With {frequency} compounding
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Compounding Frequency Comparison</CardTitle>
              <CardDescription>
                See how different compounding frequencies affect your returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Rewards</TableHead>
                    <TableHead className="text-right">Final Balance</TableHead>
                    <TableHead className="text-right">Effective APY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">None (Simple)</TableCell>
                    <TableCell className="text-right">${comparison.none.rewards.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${comparison.none.finalBalance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{comparison.none.effectiveApy.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Daily</TableCell>
                    <TableCell className="text-right">${comparison.daily.rewards.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${comparison.daily.finalBalance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{comparison.daily.effectiveApy.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Weekly</TableCell>
                    <TableCell className="text-right">${comparison.weekly.rewards.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${comparison.weekly.finalBalance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{comparison.weekly.effectiveApy.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Monthly</TableCell>
                    <TableCell className="text-right">${comparison.monthly.rewards.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${comparison.monthly.finalBalance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{comparison.monthly.effectiveApy.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Yearly</TableCell>
                    <TableCell className="text-right">${comparison.yearly.rewards.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${comparison.yearly.finalBalance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{comparison.yearly.effectiveApy.toFixed(2)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Calculation Assumptions:</strong> This calculator uses fixed APR over the entire period.
              Compounding frequency determines how often rewards are reinvested. Real staking protocols may have
              variable rates, slashing risks, and withdrawal delays. If a lockup period is specified, no withdrawals
              are modeled during that time. This is for educational purposes only.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
