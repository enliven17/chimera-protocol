import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  litProtocolClient,
  ExecutionResult,
  ExecutionHistory,
  ValidationResult,
  UserDelegation,
  ExecutionSession,
  AuditEntry,
  SecurityMetrics
} from '@/lib/lit-protocol-client';
import { toast } from 'sonner';

// Hook for Vincent skill status
export function useLitProtocolStatus() {
  return useQuery({
    queryKey: ['lit-protocol-status'],
    queryFn: () => litProtocolClient.getSkillStatus(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
}

// Hook for execution history
export function useLitExecutionHistory(userAddress: string, limit = 50) {
  return useQuery({
    queryKey: ['lit-execution-history', userAddress, limit],
    queryFn: () => litProtocolClient.getExecutionHistory(userAddress, limit),
    enabled: !!userAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// Hook for user delegations
export function useLitUserDelegations(userAddress: string) {
  return useQuery({
    queryKey: ['lit-user-delegations', userAddress],
    queryFn: () => litProtocolClient.getUserDelegations(userAddress),
    enabled: !!userAddress,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Hook for audit trail
export function useLitAuditTrail(
  userAddress: string, 
  fromDate?: string, 
  toDate?: string
) {
  return useQuery({
    queryKey: ['lit-audit-trail', userAddress, fromDate, toDate],
    queryFn: () => litProtocolClient.getAuditTrail(userAddress, fromDate, toDate),
    enabled: !!userAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for security metrics
export function useLitSecurityMetrics() {
  return useQuery({
    queryKey: ['lit-security-metrics'],
    queryFn: () => litProtocolClient.getSecurityMetrics(),
    refetchInterval: 60000, // Refetch every minute
  });
}

// Mutation for executing betting actions
export function useLitExecuteBettingAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      action: 'place_bet' | 'claim_winnings' | 'delegate_agent' | 'revoke_delegation';
      marketId?: string;
      option?: number;
      amount?: string;
      agentAddress?: string;
      maxBetAmount?: string;
      userAddress: string;
      signature?: string;
    }) => litProtocolClient.executeBettingAction(params),
    onSuccess: (data: ExecutionResult, variables) => {
      if (data.success) {
        toast.success(`${variables.action} executed successfully via Lit Protocol`);
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: ['lit-execution-history', variables.userAddress] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['envio-market-bets'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['envio-user-positions', variables.userAddress] 
        });
        
        if (variables.action.includes('delegate')) {
          queryClient.invalidateQueries({ 
            queryKey: ['lit-user-delegations', variables.userAddress] 
          });
        }
      } else {
        toast.error(`Failed to execute ${variables.action}: ${data.error}`);
      }
    },
    onError: (error, variables) => {
      console.error('Error executing betting action:', error);
      toast.error(`Failed to execute ${variables.action} via Lit Protocol`);
    },
  });
}

// Mutation for transaction validation
export function useLitValidateTransaction() {
  return useMutation({
    mutationFn: (params: {
      userAddress: string;
      contractAddress: string;
      functionName: string;
      args: any[];
      value?: string;
    }) => litProtocolClient.validateTransaction(params),
    onError: (error) => {
      console.error('Error validating transaction:', error);
      toast.error('Failed to validate transaction');
    },
  });
}

// Mutation for creating execution session
export function useLitCreateExecutionSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      userAddress: string;
      permissions: string[];
      expiresAt: number;
    }) => litProtocolClient.createExecutionSession(params),
    onSuccess: (data: ExecutionSession, variables) => {
      toast.success('Secure execution session created');
      queryClient.invalidateQueries({ 
        queryKey: ['lit-user-delegations', variables.userAddress] 
      });
    },
    onError: (error) => {
      console.error('Error creating execution session:', error);
      toast.error('Failed to create execution session');
    },
  });
}

// Mutation for revoking execution session
export function useLitRevokeExecutionSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => litProtocolClient.revokeExecutionSession(sessionId),
    onSuccess: () => {
      toast.success('Execution session revoked');
      queryClient.invalidateQueries({ queryKey: ['lit-user-delegations'] });
    },
    onError: (error) => {
      console.error('Error revoking execution session:', error);
      toast.error('Failed to revoke execution session');
    },
  });
}

// Mutation for emergency stop
export function useLitEmergencyStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userAddress: string; reason: string }) => 
      litProtocolClient.emergencyStop(params.userAddress, params.reason),
    onSuccess: (data, variables) => {
      toast.success('Emergency stop activated');
      queryClient.invalidateQueries({ 
        queryKey: ['lit-user-delegations', variables.userAddress] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['lit-execution-history', variables.userAddress] 
      });
    },
    onError: (error) => {
      console.error('Error activating emergency stop:', error);
      toast.error('Failed to activate emergency stop');
    },
  });
}

// Mutation for batch execution
export function useLitBatchExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actions: Array<{
      action: string;
      params: any;
      priority?: number;
    }>) => litProtocolClient.batchExecute(actions),
    onSuccess: (data) => {
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const totalCount = data.results?.length || 0;
      
      toast.success(`Batch execution completed: ${successCount}/${totalCount} successful`);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['lit-execution-history'] });
      queryClient.invalidateQueries({ queryKey: ['envio-market-bets'] });
      queryClient.invalidateQueries({ queryKey: ['envio-user-positions'] });
    },
    onError: (error) => {
      console.error('Error in batch execution:', error);
      toast.error('Batch execution failed');
    },
  });
}

// Combined hook for secure betting with validation
export function useLitSecureBetting() {
  const validateTransaction = useLitValidateTransaction();
  const executeBettingAction = useLitExecuteBettingAction();

  const secureBet = async (params: {
    marketId: string;
    option: number;
    amount: string;
    userAddress: string;
  }) => {
    try {
      // First validate the transaction
      const validation = await validateTransaction.mutateAsync({
        userAddress: params.userAddress,
        contractAddress: process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS!,
        functionName: 'placeBet',
        args: [params.marketId, params.option, params.amount],
      });

      if (!validation.isValid) {
        throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        toast.warning(`Warnings: ${validation.warnings.join(', ')}`);
      }

      // Execute the bet if validation passes
      return await executeBettingAction.mutateAsync({
        action: 'place_bet',
        marketId: params.marketId,
        option: params.option,
        amount: params.amount,
        userAddress: params.userAddress,
      });
    } catch (error) {
      console.error('Secure betting error:', error);
      throw error;
    }
  };

  return {
    secureBet,
    isValidating: validateTransaction.isPending,
    isExecuting: executeBettingAction.isPending,
    isLoading: validateTransaction.isPending || executeBettingAction.isPending,
  };
}

// Hook for monitoring user's Lit Protocol activity
export function useLitUserActivity(userAddress: string) {
  const executionHistory = useLitExecutionHistory(userAddress, 20);
  const delegations = useLitUserDelegations(userAddress);
  const auditTrail = useLitAuditTrail(userAddress);

  return {
    recentExecutions: executionHistory.data || [],
    activeDelegations: delegations.data || [],
    auditEntries: auditTrail.data || [],
    isLoading: executionHistory.isLoading || delegations.isLoading || auditTrail.isLoading,
    error: executionHistory.error || delegations.error || auditTrail.error,
    refetch: () => {
      executionHistory.refetch();
      delegations.refetch();
      auditTrail.refetch();
    },
  };
}