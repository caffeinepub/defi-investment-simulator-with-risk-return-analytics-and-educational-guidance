const STORAGE_KEY = 'defi-simulator-learning-links';

export interface LearningLink {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export function loadLearningLinks(): LearningLink[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load learning links:', error);
  }
  return getDefaultLinks();
}

export function saveLearningLinks(links: LearningLink[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error('Failed to save learning links:', error);
  }
}

export function getDefaultLinks(): LearningLink[] {
  return [
    {
      id: 'default-1',
      title: 'What is DeFi? A Beginner\'s Guide',
      url: 'https://ethereum.org/en/defi/',
      createdAt: Date.now(),
    },
    {
      id: 'default-2',
      title: 'Understanding Liquidation Risk',
      url: 'https://docs.aave.com/risk/asset-risk/risk-parameters',
      createdAt: Date.now(),
    },
    {
      id: 'default-3',
      title: 'DeFi Yield Farming Explained',
      url: 'https://academy.binance.com/en/articles/what-is-yield-farming-in-decentralized-finance-defi',
      createdAt: Date.now(),
    },
  ];
}
