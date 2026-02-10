import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useSimulatorState } from '../../state/useSimulatorState';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ReturnsBreakdownView() {
  const { positions, timeframeDays, returnResult } = useSimulatorState();

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Yield & Return Analysis</CardTitle>
          <CardDescription className="text-base">
            Detailed breakdown of interest earned and costs over your simulation period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Add positions in the Strategy Builder to see return metrics
            </div>
          ) : !returnResult ? (
            <div className="text-center py-12 text-muted-foreground">
              Run a simulation to calculate returns
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Deposit Interest
                  </div>
                  <div className="text-3xl font-bold text-chart-2">
                    ${returnResult.totalDepositInterest.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Earned over {timeframeDays} days
                  </div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Borrow Interest
                  </div>
                  <div className="text-3xl font-bold text-chart-1">
                    ${returnResult.totalBorrowInterest.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Cost over {timeframeDays} days
                  </div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Net Return</div>
                  <div
                    className={`text-3xl font-bold ${returnResult.netReturn >= 0 ? 'text-chart-2' : 'text-chart-1'}`}
                  >
                    {returnResult.netReturn >= 0 ? '+' : ''}$
                    {returnResult.netReturn.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {returnResult.netReturn >= 0 ? 'Profit' : 'Loss'}
                  </div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">APR / APY</div>
                  <div className="text-3xl font-bold">
                    {returnResult.apr.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    APY: {returnResult.apy.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Deposit Breakdown */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                  Deposit Interest Breakdown
                </h3>
                {returnResult.breakdown.deposits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No deposit positions</p>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Interest Earned</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {returnResult.breakdown.deposits.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.asset}</TableCell>
                              <TableCell className="text-right text-chart-2">
                                ${item.interest.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold border-t-2">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right text-chart-2">
                              ${returnResult.totalDepositInterest.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Borrow Breakdown */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-chart-1" />
                  Borrow Interest Breakdown
                </h3>
                {returnResult.breakdown.borrows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No borrow positions</p>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Interest Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {returnResult.breakdown.borrows.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.asset}</TableCell>
                              <TableCell className="text-right text-chart-1">
                                ${item.interest.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold border-t-2">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right text-chart-1">
                              ${returnResult.totalBorrowInterest.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assumptions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Calculation Assumptions:</strong> Returns are calculated using fixed interest
          rates over the simulation period. APR uses simple interest, while APY assumes daily
          compounding. Real DeFi protocols have variable rates that change based on supply and
          demand. This simulator uses simplified calculations for educational purposes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
