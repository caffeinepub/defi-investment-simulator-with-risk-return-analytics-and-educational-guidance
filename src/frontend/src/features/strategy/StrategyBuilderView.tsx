import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { useSimulatorState } from '../../state/useSimulatorState';
import { getMarketData } from '../../market-data/adapters';
import { Protocol, PositionType, Asset } from '../../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function StrategyBuilderView() {
  const {
    positions,
    selectedProtocol,
    isLiveData,
    addPosition,
    removePosition,
    setProtocol,
    setDataSource,
    clearPositions,
  } = useSimulatorState();

  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [dataSourceError, setDataSourceError] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [positionType, setPositionType] = useState<'deposit' | 'borrow'>('deposit');
  const [amount, setAmount] = useState<string>('');

  // Load market data when protocol or data source changes
  const loadMarketData = async (protocol: Protocol, isLive: boolean) => {
    setIsLoadingData(true);
    try {
      setDataSourceError('');
      const data = await getMarketData(protocol, isLive);
      setAvailableAssets(data.assets);
      if (data.assets.length > 0) {
        setSelectedAssetId(data.assets[0].id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load market data';
      setDataSourceError(errorMessage);
      
      // Automatic fallback to sample data if live data fails
      if (isLive) {
        console.warn('Live data failed, falling back to sample data:', errorMessage);
        setDataSource(false); // Update the toggle state
        try {
          const fallbackData = await getMarketData(protocol, false);
          setAvailableAssets(fallbackData.assets);
          if (fallbackData.assets.length > 0) {
            setSelectedAssetId(fallbackData.assets[0].id);
          }
        } catch (fallbackError) {
          console.error('Sample data fallback also failed:', fallbackError);
        }
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Initialize with sample data on mount
  useEffect(() => {
    loadMarketData(selectedProtocol, isLiveData);
  }, []); // Only run once on mount

  const handleProtocolChange = (value: string) => {
    const protocol = value === 'aave' ? Protocol.aave : Protocol.compound;
    setProtocol(protocol);
    loadMarketData(protocol, isLiveData);
  };

  const handleDataSourceToggle = (checked: boolean) => {
    setDataSource(checked);
    loadMarketData(selectedProtocol, checked);
  };

  const handleAddPosition = () => {
    const asset = availableAssets.find((a) => a.id === selectedAssetId);
    if (!asset || !amount || parseFloat(amount) <= 0) return;

    addPosition({
      asset,
      positionType: positionType === 'deposit' ? PositionType.deposit : PositionType.borrow,
      amount: parseFloat(amount),
    });

    setAmount('');
  };

  const selectedAsset = availableAssets.find((a) => a.id === selectedAssetId);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <img
          src="/assets/generated/defi-sim-hero.dim_1600x600.png"
          alt="DeFi Simulator"
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60 flex items-center">
          <div className="container px-8">
            <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Build Your DeFi Strategy</h2>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
              Create simulated deposit and borrow positions to explore DeFi strategies. Adjust
              parameters and see how different scenarios affect your portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol & Data Source Selection */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Market Data Settings</CardTitle>
          <CardDescription>
            Choose a protocol and data source for your simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={selectedProtocol} onValueChange={handleProtocolChange} disabled={isLoadingData}>
                <SelectTrigger id="protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aave">Aave</SelectItem>
                  <SelectItem value="compound">Compound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-source" className="flex items-center gap-2">
                Data Source
                <span className="text-xs text-muted-foreground">(Sample recommended)</span>
              </Label>
              <div className="flex items-center gap-3 h-10">
                <span className="text-sm text-muted-foreground">Sample Data</span>
                <Switch
                  id="data-source"
                  checked={isLiveData}
                  onCheckedChange={handleDataSourceToggle}
                  disabled={isLoadingData}
                />
                <span className="text-sm text-muted-foreground">Live Data</span>
              </div>
            </div>
          </div>

          {isLoadingData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Loading market data...</AlertDescription>
            </Alert>
          )}

          {dataSourceError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Live Data Error:</strong> {dataSourceError}
                {isLiveData && <div className="mt-2 text-sm">Automatically switched to Sample Data mode.</div>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Position Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add Position</CardTitle>
          <CardDescription>
            Create a new deposit or borrow position in your simulated portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="position-type">Position Type</Label>
              <Select value={positionType} onValueChange={(v) => setPositionType(v as any)}>
                <SelectTrigger id="position-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit (Supply)</SelectItem>
                  <SelectItem value="borrow">Borrow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger id="asset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.symbol} - {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddPosition} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </div>
          </div>

          {selectedAsset && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-muted/50 rounded-xl border border-border/50 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Price</div>
                <div className="font-semibold text-base">${selectedAsset.priceUSD.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Interest Rate</div>
                <div className="font-semibold text-base">{(selectedAsset.interestRate * 100).toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Liq. Threshold</div>
                <div className="font-semibold text-base">
                  {(selectedAsset.liquidationThreshold * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Value</div>
                <div className="font-semibold text-base">
                  ${amount ? (parseFloat(amount) * selectedAsset.priceUSD).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Positions */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Current Positions</CardTitle>
              <CardDescription>
                {positions.length} position{positions.length !== 1 ? 's' : ''} in your simulated
                portfolio
              </CardDescription>
            </div>
            {positions.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearPositions}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No positions yet. Add your first position above to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-5 border border-border/50 rounded-xl hover:border-border transition-colors"
                >
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Type</div>
                      <div className="font-semibold capitalize">
                        {position.positionType === PositionType.deposit ? 'Deposit' : 'Borrow'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Asset</div>
                      <div className="font-semibold">{position.asset.symbol}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Amount</div>
                      <div className="font-semibold">{position.amount.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Price</div>
                      <div className="font-semibold">${position.asset.priceUSD.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Value</div>
                      <div className="font-semibold">
                        ${(position.amount * position.asset.priceUSD).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePosition(position.id)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
