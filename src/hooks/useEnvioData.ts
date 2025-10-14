import { useQuery } from '@tanstack/react-query';
import React from 'react';

// This file is deprecated - use useDirectContract instead
// Keeping for backward compatibility

export function useBlockscoutMarkets() {
  return useQuery({
    queryKey: ['blockscout-markets'],
    queryFn: async () => {
      console.warn('useBlockscoutMarkets is deprecated - use useDirectContract instead');
      return [];
    },
    refetchInterval: 10000,
    retry: 2,
  });
}

// Backward compatibility
export const useEnvioMarkets = useBlockscoutMarkets;

export function useBlockscoutMarketBets(marketId: string) {
  return useQuery({
    queryKey: ['blockscout-market-bets', marketId],
    queryFn: async () => {
      console.warn('useBlockscoutMarketBets is deprecated - use direct contract calls instead');
      return [];
    },
    enabled: !!marketId,
    refetchInterval: 15000,
  });
}

// Backward compatibility
export const useEnvioMarketBets = useBlockscoutMarketBets;

export function useBlockscoutUserBets(userAddress: string) {
  return useQuery({
    queryKey: ['blockscout-user-bets', userAddress],
    queryFn: async () => {
      console.warn('useBlockscoutUserBets is deprecated');
      return [];
    },
    enabled: !!userAddress,
    refetchInterval: 20000,
  });
}

// Backward compatibility
export const useEnvioUserBets = useBlockscoutUserBets;

export function useBlockscoutChimeraStats() {
  return useQuery({
    queryKey: ['blockscout-chimera-stats'],
    queryFn: async () => {
      console.warn('useBlockscoutChimeraStats is deprecated');
      return null;
    },
    refetchInterval: 30000,
  });
}

// Backward compatibility - market resolutions now part of stats
export const useEnvioMarketResolutions = useBlockscoutChimeraStats;

export function useBlockscoutAgentDelegations(userAddress: string) {
  return useQuery({
    queryKey: ['blockscout-agent-delegations', userAddress],
    queryFn: async () => {
      console.warn('useBlockscoutAgentDelegations is deprecated');
      return [];
    },
    enabled: !!userAddress,
    refetchInterval: 30000,
  });
}

// Backward compatibility
export const useEnvioAgentDelegations = useBlockscoutAgentDelegations;

// Market activity hook (deprecated)
export function useBlockscoutMarketActivity(marketId: string) {
  const betsQuery = useBlockscoutMarketBets(marketId);
  const statsQuery = useBlockscoutChimeraStats();

  return {
    bets: [],
    stats: null,
    isLoading: false,
    error: null,
    refetch: () => {
      console.warn('useBlockscoutMarketActivity is deprecated');
    }
  };
}

// Backward compatibility
export const useEnvioMarketActivity = useBlockscoutMarketActivity;

// Market statistics (deprecated)
export function useBlockscoutMarketStats(marketId: string) {
  const stats = React.useMemo(() => {
    return {
      totalBets: 0,
      totalVolume: '0',
      optionAVolume: '0',
      optionBVolume: '0',
      uniqueBettors: 0,
      averageBetSize: '0',
      lastBetTime: null
    };
  }, []);

  return {
    ...stats,
    isLoading: false
  };
}

// Backward compatibility
export const useEnvioMarketStats = useBlockscoutMarketStats;

// Helper to format Blockscout timestamps
export function formatBlockscoutTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

// Backward compatibility
export const formatEnvioTimestamp = formatBlockscoutTimestamp;

// Helper to calculate market odds from Blockscout data
export function calculateMarketOdds(bets: any[]) {
  if (!bets || bets.length === 0) {
    return { optionA: 50, optionB: 50 };
  }

  // Since Blockscout doesn't have option data, we'll use transaction value as proxy
  const totalVolume = bets.reduce((sum: number, bet: any) => sum + parseFloat(bet.amount || '0'), 0);
  
  // Placeholder logic - in real implementation, you'd need to decode transaction data
  return {
    optionA: 50, // Placeholder
    optionB: 50  // Placeholder
  };
}