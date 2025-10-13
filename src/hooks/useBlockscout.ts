import { useQuery } from '@tanstack/react-query';
import { blockscoutClient } from '@/lib/blockscout-client';

// Hook for transaction details
export function useBlockscoutTransaction(txHash: string) {
  return useQuery({
    queryKey: ['blockscout-transaction', txHash],
    queryFn: () => blockscoutClient.getTransaction(txHash),
    enabled: !!txHash,
    staleTime: 60000, // 1 minute
  });
}

// Hook for contract details
export function useBlockscoutContract(address: string) {
  return useQuery({
    queryKey: ['blockscout-contract', address],
    queryFn: () => blockscoutClient.getContract(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for token details
export function useBlockscoutToken(address: string) {
  return useQuery({
    queryKey: ['blockscout-token', address],
    queryFn: () => blockscoutClient.getToken(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for address transactions
export function useBlockscoutAddressTransactions(address: string, limit = 50) {
  return useQuery({
    queryKey: ['blockscout-address-transactions', address, limit],
    queryFn: () => blockscoutClient.getAddressTransactions(address, limit),
    enabled: !!address,
    refetchInterval: 30000, // 30 seconds
  });
}

// Hook for ChimeraProtocol stats
export function useBlockscoutChimeraStats() {
  return useQuery({
    queryKey: ['blockscout-chimera-stats'],
    queryFn: () => blockscoutClient.getChimeraProtocolStats(),
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
  });
}

// Hook for market analytics
export function useBlockscoutMarketAnalytics(marketId: number) {
  return useQuery({
    queryKey: ['blockscout-market-analytics', marketId],
    queryFn: () => blockscoutClient.getMarketAnalytics(marketId),
    enabled: marketId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for PYUSD stats
export function useBlockscoutPYUSDStats() {
  return useQuery({
    queryKey: ['blockscout-pyusd-stats'],
    queryFn: () => blockscoutClient.getPYUSDStats(),
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook for ChimeraProtocol contract info
export function useChimeraContractInfo() {
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  return useBlockscoutContract(chimeraAddress!);
}

// Hook for PYUSD token info
export function usePYUSDTokenInfo() {
  const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
  return useBlockscoutToken(pyusdAddress!);
}

// Hook for user's transaction history on ChimeraProtocol
export function useUserChimeraTransactions(userAddress: string) {
  const { data: allTransactions, ...query } = useBlockscoutAddressTransactions(userAddress, 100);
  
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS?.toLowerCase();
  
  const chimeraTransactions = allTransactions?.filter(tx => 
    tx.to?.toLowerCase() === chimeraAddress || 
    tx.from?.toLowerCase() === chimeraAddress
  ) || [];

  return {
    ...query,
    data: chimeraTransactions,
  };
}

// Hook for real-time transaction monitoring
export function useBlockscoutRealTimeTransactions() {
  const { data: chimeraStats, refetch } = useBlockscoutChimeraStats();
  
  // This would be enhanced with WebSocket connection in a real implementation
  return {
    stats: chimeraStats,
    refetch,
    // In a real implementation, this would return WebSocket connection status
    isConnected: false,
    subscribe: (callback: (tx: any) => void) => {
      // This would set up WebSocket subscription
      console.log('Setting up real-time transaction monitoring...');
      return blockscoutClient.subscribeToChimeraTransactions(callback);
    },
  };
}

// Combined hook for comprehensive blockchain analytics
export function useBlockchainAnalytics() {
  const chimeraStats = useBlockscoutChimeraStats();
  const pyusdStats = useBlockscoutPYUSDStats();
  const chimeraContract = useChimeraContractInfo();
  const pyusdToken = usePYUSDTokenInfo();

  return {
    chimera: {
      stats: chimeraStats.data,
      contract: chimeraContract.data,
      isLoading: chimeraStats.isLoading || chimeraContract.isLoading,
      error: chimeraStats.error || chimeraContract.error,
    },
    pyusd: {
      stats: pyusdStats.data,
      token: pyusdToken.data,
      isLoading: pyusdStats.isLoading || pyusdToken.isLoading,
      error: pyusdStats.error || pyusdToken.error,
    },
    refetch: () => {
      chimeraStats.refetch();
      pyusdStats.refetch();
      chimeraContract.refetch();
      pyusdToken.refetch();
    },
  };
}

// Helper function to format Blockscout explorer URLs
export function getBlockscoutUrl(type: 'tx' | 'address' | 'token', hash: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL || 'https://eth.blockscout.com';
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`;
    case 'address':
      return `${baseUrl}/address/${hash}`;
    case 'token':
      return `${baseUrl}/token/${hash}`;
    default:
      return baseUrl;
  }
}