import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Plus, Trash2, BookOpen, Lightbulb, AlertCircle } from 'lucide-react';
import { useSimulatorState } from '../../state/useSimulatorState';
import { generateGuidance } from '../../guidance/generateGuidance';
import {
  loadLearningLinks,
  saveLearningLinks,
  LearningLink,
} from '../../services/learningLinksStore';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LearningGuidanceView() {
  const { riskResult, returnResult } = useSimulatorState();
  const [links, setLinks] = useState<LearningLink[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    setLinks(loadLearningLinks());
  }, []);

  const guidance = generateGuidance(riskResult, returnResult);

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newLink: LearningLink = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      createdAt: Date.now(),
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    saveLearningLinks(updatedLinks);
    setNewTitle('');
    setNewUrl('');
  };

  const handleRemoveLink = (id: string) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
    saveLearningLinks(updatedLinks);
  };

  return (
    <div className="space-y-8">
      {/* Educational Guidance */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Personalized Guidance
          </CardTitle>
          <CardDescription className="text-base">
            Educational insights based on your simulated strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Risk Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Risk Analysis
            </h3>
            <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {guidance.riskAnalysis}
              </p>
            </div>
          </div>

          <Separator />

          {/* Parameter Suggestions */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Parameter Suggestions
            </h3>
            {guidance.parameterSuggestions.length === 0 ? (
              <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                <p className="text-muted-foreground leading-relaxed">
                  No specific suggestions at this time. Your strategy looks well-balanced.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {guidance.parameterSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg border border-border/50 flex items-start gap-3"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Key Insights */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Key Insights
            </h3>
            {guidance.keyInsights.length === 0 ? (
              <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
                <p className="text-muted-foreground leading-relaxed">
                  Run a simulation to see key insights about your strategy.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {guidance.keyInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg border border-border/50 flex items-start gap-3"
                  >
                    <div className="h-6 w-6 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-chart-2">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Resources */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Learning Resources
          </CardTitle>
          <CardDescription className="text-base">
            Curated educational links to deepen your DeFi knowledge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resource List */}
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-border transition-colors"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1 group"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLink(link.id)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Add New Link */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Resource</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-title">Title</Label>
                <Input
                  id="link-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., DeFi Risk Management Guide"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button onClick={handleAddLink} disabled={!newTitle.trim() || !newUrl.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Educational Note */}
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          <strong>Educational Purpose:</strong> This guidance is generated based on your simulated
          strategy and is for educational purposes only. It is not financial advice. Always do your
          own research and consider consulting with financial professionals before making real
          investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
