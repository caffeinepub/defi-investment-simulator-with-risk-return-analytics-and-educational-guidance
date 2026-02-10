import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategyBuilderView } from './features/strategy/StrategyBuilderView';
import { ScenarioSimulatorView } from './features/simulator/ScenarioSimulatorView';
import { RiskMetricsView } from './features/risk/RiskMetricsView';
import { ReturnsBreakdownView } from './features/returns/ReturnsBreakdownView';
import { LearningGuidanceView } from './features/learning/LearningGuidanceView';
import { LpCalculatorView } from './features/lp/LpCalculatorView';
import { StakingCalculatorView } from './features/staking/StakingCalculatorView';
import { Heart } from 'lucide-react';

function App() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'defi-simulator'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <img
              src="/assets/generated/defi-sim-logo.dim_512x512.png"
              alt="DeFi Simulator"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">DeFi Simulator</h1>
              <p className="text-sm text-muted-foreground">
                Learn DeFi strategies with risk & return analytics
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10">
        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-10 h-auto p-1 bg-muted/50">
            <TabsTrigger value="strategy" className="text-sm py-3">Strategy Builder</TabsTrigger>
            <TabsTrigger value="simulator" className="text-sm py-3">Simulator</TabsTrigger>
            <TabsTrigger value="risk" className="text-sm py-3">Risk Metrics</TabsTrigger>
            <TabsTrigger value="returns" className="text-sm py-3">Returns</TabsTrigger>
            <TabsTrigger value="lp" className="text-sm py-3">LP Calculator</TabsTrigger>
            <TabsTrigger value="staking" className="text-sm py-3">Staking</TabsTrigger>
            <TabsTrigger value="learning" className="text-sm py-3">Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy" className="mt-0">
            <StrategyBuilderView />
          </TabsContent>

          <TabsContent value="simulator" className="mt-0">
            <ScenarioSimulatorView />
          </TabsContent>

          <TabsContent value="risk" className="mt-0">
            <RiskMetricsView />
          </TabsContent>

          <TabsContent value="returns" className="mt-0">
            <ReturnsBreakdownView />
          </TabsContent>

          <TabsContent value="lp" className="mt-0">
            <LpCalculatorView />
          </TabsContent>

          <TabsContent value="staking" className="mt-0">
            <StakingCalculatorView />
          </TabsContent>

          <TabsContent value="learning" className="mt-0">
            <LearningGuidanceView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>© {currentYear} DeFi Simulator</span>
              <span className="hidden md:inline">•</span>
              <span className="text-xs">Educational purposes only - not financial advice</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-foreground/60 fill-foreground/60" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
