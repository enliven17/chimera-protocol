import { useQuery } from '@tanstack/react-query';
import { EnvioClient } from '@/lib/envio-client';
import React from 'react';

const envioClient = new EnvioClient();

export function useEnvioMarkets() {
  return useQuery({
    queryKey: ['envio-markets'],
    queryFn: async () => {
      try {
        return await envioClient.getActiveMarkets();
      } catch (error) {
        console.warn('Envio API not available, using fallback data');
        return [];
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1, // Only retry once
  });
}

export function useEnvioMarketBets(marketId: string) {
  return useQuery({
    queryKey: ['envio-market-bets', marketId],
    queryFn: async () => {
      return await envioClient.getMarketHistory(marketId);
    },
    enabled: !!marketId,
    refetchInterval: 3000, // Refetch every 3 seconds for active betting
  });
}

export function useEnvioUserBets(userAddress: string) {
  return useQuery({
    queryKey: ['envio-user-bets', userAddress],
    queryFn: async () => {
      return await envioClient.getUserBets(userAddress.toLowerCase());
    },
    enabled: !!userAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useEnvioMarketResolutions() {
  return useQuery({
    queryKey: ['envio-market-resolutions'],
    queryFn: async () => {
      return await envioClient.getMarketResolutions();
    },
  });
}

export function useEnvioAgentDelegations(userAddress: string) {
  return useQuery({
    queryKey: ['envio-agent-delegations', userAddress],
    queryFn: async () => {
      return await envioClient.getAgentDelegations(userAddress.toLowerCase());
    },
    enabled: !!userAddress,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

// Real-time market activity hook
export function useEnvioMarketActivity(marketId: string) {
  const betsQuery = useEnvioMarketBets(marketId);
  const resolutionsQuery = useEnvioMarketResolutions();

  return {
    bets: betsQuery.data || [],
    resolutions: resolutionsQuery.data?.filter(r => r.marketId === marketId) || [],
    isLoading: betsQuery.isLoading || resolutionsQuery.isLoading,
    error: betsQuery.error || resolutionsQuery.error,
    refetch: () => {
      betsQuery.refetch();
      resolutionsQuery.refetch();
    }
  };
}

// Market statistics derived from Envio data
export function useEnvioMarketStats(marketId: string) {
  const { data: bets, isLoading } = useEnvioMarketBets(marketId);

  const stats = React.useMemo(() => {
    if (!bets || bets.length === 0) {
      return {
        totalBets: 0,
        totalVolume: '0',
        optionAVolume: '0',
        optionBVolume: '0',
        uniqueBettors: 0,
        averageBetSize: '0',
        lastBetTime: null
      };
    }

    const totalBets = bets.length;
    const totalVolume = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const optionABets = bets.filter(bet => bet.option === 0);
    const optionBBets = bets.filter(bet => bet.option === 1);
    
    const optionAVolume = optionABets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const optionBVolume = optionBBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    
    const uniqueBettors = new Set(bets.map(bet => bet.user)).size;
    const averageBetSize = totalVolume / totalBets;
    const lastBetTime = bets[0]?.block_timestamp;

    return {
      totalBets,
      totalVolume: totalVolume.toFixed(2),
      optionAVolume: optionAVolume.toFixed(2),
      optionBVolume: optionBVolume.toFixed(2),
      uniqueBettors,
      averageBetSize: averageBetSize.toFixed(2),
      lastBetTime
    };
  }, [bets]);

  return {
    ...stats,
    isLoading
  };
}

// Helper to format Envio timestamps
export function formatEnvioTimestamp(timestamp: string): string {
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
}

// Helper to calculate market odds from Envio data
export function calculateMarketOdds(bets: any[]) {
  if (!bets || bets.length === 0) {
    return { optionA: 50, optionB: 50 };
  }

  const optionAVolume = bets
    .filter(bet => bet.option === 0)
    .reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    
  const optionBVolume = bets
    .filter(bet => bet.option === 1)
    .reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

  const totalVolume = optionAVolume + optionBVolume;
  
  if (totalVolume === 0) {
    return { optionA: 50, optionB: 50 };
  }

  return {
    optionA: Math.round((optionAVolume / totalVolume) * 100),
    optionB: Math.round((optionBVolume / totalVolume) * 100)
  };
}