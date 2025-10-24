import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { createPythUpdater, PYTH_PRICE_IDS } from '@/lib/pyth-price-updater';
import { toast } from 'sonner';

// Hook for updating prices on-chain
export function usePythPriceUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      priceIds, 
      signer 
    }: { 
      priceIds: string[]; 
      signer: ethers.Signer;
    }) => {
      const updater = createPythUpdater(signer);
      return updater.updatePricesOnChain(priceIds);
    },
    onSuccess: (receipt) => {
      toast.success(`Prices updated on-chain! Tx: ${receipt.hash.slice(0, 10)}...`);
      // Invalidate price queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['pyth-price'] });
      queryClient.invalidateQueries({ queryKey: ['pyth-on-chain-price'] });
    },
    onError: (error) => {
      console.error('Price update failed:', error);
      toast.error('Failed to update prices on-chain');
    },
  });
}

// Hook for getting on-chain price (after update)
export function usePythOnChainPrice(priceId: string, enabled = true) {
  return useQuery({
    queryKey: ['pyth-on-chain-price', priceId],
    queryFn: async () => {
      const updater = createPythUpdater();
      return updater.getPriceUnsafe(priceId); // Use unsafe for reading
    },
    enabled: enabled && !!priceId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });
}

// Hook for complete update and consume flow
export function usePythUpdateAndConsume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      priceId, 
      signer 
    }: { 
      priceId: string; 
      signer: ethers.Signer;
    }) => {
      const updater = createPythUpdater(signer);
      return updater.updateAndGetPrice(priceId);
    },
    onSuccess: (data) => {
      toast.success(`Price updated and consumed! Current: $${data.formattedPrice}`);
      queryClient.invalidateQueries({ queryKey: ['pyth-price'] });
      queryClient.invalidateQueries({ queryKey: ['pyth-on-chain-price'] });
    },
    onError: (error) => {
      console.error('Update and consume failed:', error);
      toast.error('Failed to update and consume price');
    },
  });
}

// Hook to check if price is stale
export function usePythPriceStaleCheck(priceId: string, maxAgeSeconds = 60) {
  return useQuery({
    queryKey: ['pyth-price-stale', priceId, maxAgeSeconds],
    queryFn: async () => {
      const updater = createPythUpdater();
      return updater.isPriceStale(priceId, maxAgeSeconds);
    },
    enabled: !!priceId,
    refetchInterval: 10000, // Check every 10 seconds
  });
}

// Hook for auto-updating stale prices
export function usePythAutoUpdate(priceId: string, maxAgeSeconds = 60) {
  const updateMutation = usePythPriceUpdate();
  const { data: isStale } = usePythPriceStaleCheck(priceId, maxAgeSeconds);

  const autoUpdate = async (signer: ethers.Signer) => {
    if (isStale) {
      return updateMutation.mutateAsync({ priceIds: [priceId], signer });
    }
  };

  return {
    isStale,
    autoUpdate,
    isUpdating: updateMutation.isPending,
  };
}

// Hook for batch price updates
export function usePythBatchUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      priceIds, 
      signer 
    }: { 
      priceIds: string[]; 
      signer: ethers.Signer;
    }) => {
      const updater = createPythUpdater(signer);
      return updater.batchUpdatePrices(priceIds);
    },
    onSuccess: (receipt) => {
      toast.success(`Batch price update completed! Tx: ${receipt.hash.slice(0, 10)}...`);
      queryClient.invalidateQueries({ queryKey: ['pyth-price'] });
      queryClient.invalidateQueries({ queryKey: ['pyth-on-chain-price'] });
    },
    onError: (error) => {
      console.error('Batch update failed:', error);
      toast.error('Failed to update prices in batch');
    },
  });
}

// Convenience hooks for common assets
export function useBTCPriceUpdate() {
  const updateMutation = usePythPriceUpdate();
  
  const updateBTCPrice = (signer: ethers.Signer) => {
    return updateMutation.mutateAsync({ 
      priceIds: [PYTH_PRICE_IDS.BTC_USD], 
      signer 
    });
  };

  return {
    updateBTCPrice,
    isUpdating: updateMutation.isPending,
  };
}

export function useETHPriceUpdate() {
  const updateMutation = usePythPriceUpdate();
  
  const updateETHPrice = (signer: ethers.Signer) => {
    return updateMutation.mutateAsync({ 
      priceIds: [PYTH_PRICE_IDS.ETH_USD], 
      signer 
    });
  };

  return {
    updateETHPrice,
    isUpdating: updateMutation.isPending,
  };
}

// Hook for getting update fee estimate
export function usePythUpdateFee(priceIds: string[]) {
  return useQuery({
    queryKey: ['pyth-update-fee', priceIds.join(',')],
    queryFn: async () => {
      const updater = createPythUpdater();
      const updateData = await updater.fetchPriceUpdateData(priceIds);
      
      // Get fee from contract
      const pythContract = updater['pythContract'];
      const fee = await pythContract.getUpdateFee(updateData);
      
      return {
        fee: fee.toString(),
        formattedFee: ethers.formatEther(fee),
        priceIds,
      };
    },
    enabled: priceIds.length > 0,
    staleTime: 30000, // Fee doesn't change often
  });
}