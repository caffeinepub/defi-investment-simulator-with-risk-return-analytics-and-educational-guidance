import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, AlertCircle } from 'lucide-react';
import { useSimulatorState } from '../../state/useSimulatorState';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ScenarioSimulatorView() {
  const {
    positions,
    timeframeDays,
    selectedProtocol,
    isLiveData,
    simulationResult,
    setTimeframe,
    runSimulation,
  } = useSimulatorState();

  const handleRunSimulation = () => {
    if (positions.length === 0) return;
    runSimulation();
  };

  const displaySteps = simulationResult?.steps.filter((_, i) => {
    // Show first, last, and every 5th day for readability
    return i === 0 || i === simulationResult.steps.length - 1 || i % 5 === 0;
  });

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Simulation Configuration</CardTitle>
          <CardDescription className="text-base">
            Configure the timeframe and run your DeFi strategy simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (Days)</Label>
              <Input
                id="timeframe"
                type="number"
                value={timeframeDays}
                onChange={(e) => setTimeframe(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
              />
              <p className="text-xs text-muted-foreground">
                Simulate your strategy over 1-365 days
              </p>
            </div>

            <div className="space-y-2">
              <Label>Current Protocol</Label>
              <div className="h-10 flex items-center px-4 border border-border/50 rounded-lg bg-muted/50">
                <span className="capitalize">{selectedProtocol}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Source</Label>
              <div className="h-10 flex items-center px-4 border border-border/50 rounded-lg bg-muted/50">
                <span>{isLiveData ? 'Live Data' : 'Sample Data'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleRunSimulation}
              disabled={positions.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Simulation
            </Button>
            {positions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add positions in the Strategy Builder to run a simulation
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {simulationResult && (
        <>
          {/* Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Simulation Results</CardTitle>
              <CardDescription>
                Final portfolio state after {timeframeDays} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Total Deposits</div>
                  <div className="text-3xl font-bold text-chart-2">
                    ${simulationResult.finalTotals.totalDeposits.toFixed(2)}
                  </div>
                </div>
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Total Borrows</div>
                  <div className="text-3xl font-bold text-chart-1">
                    ${simulationResult.finalTotals.totalBorrows.toFixed(2)}
                  </div>
                </div>
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Net Value</div>
                  <div className="text-3xl font-bold">
                    ${simulationResult.finalTotals.netValue.toFixed(2)}
                  </div>
                </div>
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Health Factor</div>
                  <div className="text-3xl font-bold">
                    {simulationResult.finalTotals.healthFactor > 99
                      ? '∞'
                      : simulationResult.finalTotals.healthFactor.toFixed(2)}
                  </div>
                </div>
                <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">Liq. Price</div>
                  <div className="text-3xl font-bold">
                    {simulationResult.finalTotals.liquidationPrice.toFixed(4)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Simulation Timeline</CardTitle>
              <CardDescription>
                Day-by-day progression of your portfolio (showing key milestones)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead className="text-right">Deposits</TableHead>
                      <TableHead className="text-right">Borrows</TableHead>
                      <TableHead className="text-right">Net Value</TableHead>
                      <TableHead className="text-right">Daily Interest</TableHead>
                      <TableHead className="text-right">Health Factor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displaySteps?.map((step) => (
                      <TableRow key={step.day}>
                        <TableCell className="font-medium">Day {step.day}</TableCell>
                        <TableCell className="text-right text-chart-2">
                          ${step.depositValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-chart-1">
                          ${step.borrowValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${step.netValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${step.interestAccrued.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {step.healthFactor > 99 ? '∞' : step.healthFactor.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This simulation uses deterministic calculations with fixed
              interest rates. Running the same simulation with identical inputs will always produce
              the same results. Real DeFi protocols have variable rates and additional factors.
            </AlertDescription>
          </Alert>
        </>
      )}

      {!simulationResult && positions.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center text-muted-foreground">
            Click "Run Simulation" to see how your strategy performs over time
          </CardContent>
        </Card>
      )}
    </div>
  );
}
