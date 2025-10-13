import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

// ChimeraProtocol ABI (simplified for key functions)
const CHIMERA_ABI = [
  // Read functions
  "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove))",
  "function getAllMarkets() view returns (tuple[])",
  "function getActiveMarkets() view returns (tuple[])",
  "function getUserPosition(address user, uint256 marketId) view returns (tuple(uint256 optionAShares, uint256 optionBShares, uint256 totalInvested))",
  "function isAgentDelegated(address user, address agent) view returns (bool)",
  "function getAgentMaxBet(address agent) view returns (uint256)",
  "function marketCounter() view returns (uint256)",
  "function pyusdToken() view returns (address)",
  "function pyth() view returns (address)",
  
  // Write functions
  "function createMarket(string title, string description, string optionA, string optionB, uint8 category, uint256 endTime, uint256 minBet, uint256 maxBet, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove) returns (uint256)",
  "function placeBet(uint256 marketId, uint8 option, uint256 amount)",
  "function placeBetForUser(uint256 marketId, uint8 option, uint256 amount, address user)",
  "function delegateToAgent(address agent, uint256 maxBetAmount)",
  "function revokeDelegation(address agent)",
  "function updateAgentMaxBet(address agent, uint256 maxBetAmount)",
  "function claimWinnings(uint256 marketId)",
  "function resolveMarket(uint256 marketId, uint8 outcome)",
  "function resolvePriceMarket(uint256 marketId, bytes[] priceUpdateData) payable",
  
  // Events
  "event MarketCreated(uint256 indexed marketId, string title, address indexed creator, uint8 marketType)",
  "event BetPlaced(uint256 indexed marketId, address indexed user, address indexed agent, uint8 option, uint256 amount, uint256 shares)",
  "event MarketResolved(uint256 indexed marketId, uint8 outcome, address indexed resolver, int64 finalPrice)",
  "event AgentDelegationUpdated(address indexed user, address indexed agent, bool approved, uint256 maxBetAmount)",
] as const;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS as `0x${string}`;

export function useChimeraProtocol() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useMarket = (marketId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getMarket",
      args: [BigInt(marketId)],
    });
  };

  const useAllMarkets = () => {
    const result = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getAllMarkets",
    });

    // Transform contract data to frontend format
    const transformedData = result.data ? (result.data as any[]).map(transformMarket) : [];
    
    return {
      ...result,
      data: transformedData
    };
  };

  const useActiveMarkets = () => {
    const result = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getActiveMarkets",
    });

    // Transform contract data to frontend format
    const transformedData = result.data ? (result.data as any[]).map(transformMarket) : [];
    
    return {
      ...result,
      data: transformedData
    };
  };

  const useUserPosition = (userAddress: `0x${string}`, marketId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getUserPosition",
      args: [userAddress, BigInt(marketId)],
    });
  };

  const useAgentDelegation = (userAddress: `0x${string}`, agentAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "isAgentDelegated",
      args: [userAddress, agentAddress],
    });
  };

  const useMarketCounter = () => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "marketCounter",
    });
  };

  // Write functions
  const createMarket = async (marketData: {
    title: string;
    description: string;
    optionA: string;
    optionB: string;
    category: number;
    endTime: number;
    minBet: string;
    maxBet: string;
    imageUrl: string;
    marketType: number;
    pythPriceId?: string;
    targetPrice?: string;
    priceAbove?: boolean;
  }) => {
    try {
      const minBetWei = parseUnits(marketData.minBet, 6); // PYUSD has 6 decimals
      const maxBetWei = parseUnits(marketData.maxBet, 6);
      const targetPriceScaled = marketData.targetPrice ? 
        parseUnits(marketData.targetPrice, 8) : BigInt(0); // Pyth uses 8 decimals

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "createMarket",
        args: [
          marketData.title,
          marketData.description,
          marketData.optionA,
          marketData.optionB,
          marketData.category,
          BigInt(marketData.endTime),
          minBetWei,
          maxBetWei,
          marketData.imageUrl,
          marketData.marketType,
          (marketData.pythPriceId || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
          targetPriceScaled,
          marketData.priceAbove || false,
        ],
      });

      toast.success("Market creation transaction submitted!");
    } catch (error) {
      console.error("Error creating market:", error);
      toast.error("Failed to create market");
    }
  };

  const placeBet = async (marketId: number, option: number, amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "placeBet",
        args: [BigInt(marketId), option, amountWei],
      });

      toast.success("Bet placement transaction submitted!");
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error("Failed to place bet");
    }
  };

  const delegateToAgent = async (agentAddress: `0x${string}`, maxBetAmount: string) => {
    try {
      const maxBetWei = parseUnits(maxBetAmount, 6);

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "delegateToAgent",
        args: [agentAddress, maxBetWei],
      });

      toast.success("Agent delegation transaction submitted!");
    } catch (error) {
      console.error("Error delegating to agent:", error);
      toast.error("Failed to delegate to agent");
    }
  };

  const revokeDelegation = async (agentAddress: `0x${string}`) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "revokeDelegation",
        args: [agentAddress],
      });

      toast.success("Delegation revocation transaction submitted!");
    } catch (error) {
      console.error("Error revoking delegation:", error);
      toast.error("Failed to revoke delegation");
    }
  };

  const claimWinnings = async (marketId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "claimWinnings",
        args: [BigInt(marketId)],
      });

      toast.success("Claim winnings transaction submitted!");
    } catch (error) {
      console.error("Error claiming winnings:", error);
      toast.error("Failed to claim winnings");
    }
  };

  return {
    // Read hooks
    useMarket,
    useAllMarkets,
    useActiveMarkets,
    useUserPosition,
    useAgentDelegation,
    useMarketCounter,
    
    // Write functions
    createMarket,
    placeBet,
    delegateToAgent,
    revokeDelegation,
    claimWinnings,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

// Helper functions
export const formatPYUSD = (amount: bigint) => {
  return formatUnits(amount, 6);
};

export const parsePYUSD = (amount: string) => {
  return parseUnits(amount, 6);
};

// Transform contract market data to frontend format
const transformMarket = (contractMarket: any) => {
  return {
    id: contractMarket.id.toString(),
    title: contractMarket.title,
    description: contractMarket.description,
    category: Number(contractMarket.category),
    optionA: contractMarket.optionA,
    optionB: contractMarket.optionB,
    creator: contractMarket.creator,
    createdAt: contractMarket.createdAt.toString(),
    endTime: contractMarket.endTime.toString(),
    minBet: formatUnits(contractMarket.minBet, 6),
    maxBet: formatUnits(contractMarket.maxBet, 6),
    status: Number(contractMarket.status),
    outcome: contractMarket.resolved ? Number(contractMarket.outcome) : null,
    resolved: contractMarket.resolved,
    totalOptionAShares: formatUnits(contractMarket.totalOptionAShares, 6),
    totalOptionBShares: formatUnits(contractMarket.totalOptionBShares, 6),
    totalPool: formatUnits(contractMarket.totalPool, 6),
    imageURI: contractMarket.imageUrl,
    marketType: Number(contractMarket.marketType),
    pythPriceId: contractMarket.pythPriceId,
    targetPrice: contractMarket.targetPrice ? formatUnits(contractMarket.targetPrice, 8) : null,
    priceAbove: contractMarket.priceAbove
  };
};