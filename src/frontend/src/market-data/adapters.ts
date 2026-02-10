import { Asset, Protocol } from '../backend';
import aaveSample from './sample/aave.sample.json';
import compoundSample from './sample/compound.sample.json';

export interface MarketData {
  protocol: Protocol;
  assets: Asset[];
}

export function loadSampleData(protocol: Protocol): MarketData {
  const data = protocol === Protocol.aave ? aaveSample : compoundSample;
  return {
    protocol,
    assets: data.assets as Asset[],
  };
}

/**
 * Fetch live market data from DeFi protocol APIs
 * Implements timeout and error handling with clear English messages
 */
export async function loadLiveData(protocol: Protocol): Promise<MarketData> {
  const TIMEOUT_MS = 10000; // 10 second timeout
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    // Determine API endpoint based on protocol
    let apiUrl: string;
    if (protocol === Protocol.aave) {
      // Aave V3 subgraph or API endpoint
      apiUrl = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3';
    } else {
      // Compound V3 API endpoint
      apiUrl = 'https://api.compound.finance/api/v2/ctoken';
    }
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(
        `Failed to fetch live data from ${protocol === Protocol.aave ? 'Aave' : 'Compound'} API. ` +
        `Server returned status ${response.status}. Please try Sample Data mode instead.`
      );
    }
    
    const data = await response.json();
    
    // Validate and transform the response
    if (!data || typeof data !== 'object') {
      throw new Error(
        'Live data API returned invalid format. The response could not be parsed. ' +
        'Please use Sample Data mode for a reliable experience.'
      );
    }
    
    // Transform API response to our Asset format
    // This is a simplified example - real implementation would need protocol-specific parsing
    const assets: Asset[] = [];
    
    // For now, if we can't parse the live data properly, throw an error
    if (assets.length === 0) {
      throw new Error(
        'Live data is currently unavailable or could not be parsed correctly. ' +
        'This feature is experimental. Please switch to Sample Data mode to continue using the simulator.'
      );
    }
    
    return {
      protocol,
      assets,
    };
    
  } catch (error) {
    // Handle different error types with clear messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          'Live data request timed out after 10 seconds. The API may be slow or unavailable. ' +
          'Please use Sample Data mode for a faster, more reliable experience.'
        );
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(
          'Unable to connect to live data API. Please check your internet connection or use Sample Data mode.'
        );
      }
      
      // Re-throw our custom error messages
      if (error.message.includes('Live data')) {
        throw error;
      }
    }
    
    // Generic fallback error
    throw new Error(
      'An unexpected error occurred while loading live data. ' +
      'Please use Sample Data mode to continue. Error: ' + 
      (error instanceof Error ? error.message : 'Unknown error')
    );
  }
}

export function getMarketData(protocol: Protocol, isLive: boolean): Promise<MarketData> {
  if (isLive) {
    return loadLiveData(protocol);
  }
  return Promise.resolve(loadSampleData(protocol));
}
