import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

// ERC20 ABI for PYUSD token
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

const PYUSD_ADDRESS = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS as `0x${string}`;
const CHIMERA_ADDRESS = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS as `0x${string}`;

export function usePYUSD() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useBalance = (address: `0x${string}` | undefined) => {
    return useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  const useAllowance = (owner: `0x${string}` | undefined, spender: `0x${string}`) => {
    return useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: owner ? [owner, spender] : undefined,
      query: {
        enabled: !!owner,
      },
    });
  };

  const useChimeraAllowance = (owner: `0x${string}` | undefined) => {
    return useAllowance(owner, CHIMERA_ADDRESS);
  };

  const useTokenInfo = () => {
    const name = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "name",
    });

    const symbol = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "symbol",
    });

    const decimals = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "decimals",
    });

    const totalSupply = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "totalSupply",
    });

    return {
      name: name.data,
      symbol: symbol.data,
      decimals: decimals.data,
      totalSupply: totalSupply.data,
      isLoading: name.isLoading || symbol.isLoading || decimals.isLoading || totalSupply.isLoading,
    };
  };

  // Write functions
  const approve = async (spender: `0x${string}`, amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals

      await writeContract({
        address: PYUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amountWei],
      });

      toast.success("Approval transaction submitted!");
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve");
    }
  };

  const approveChimera = async (amount: string) => {
    return approve(CHIMERA_ADDRESS, amount);
  };

  const approveMax = async (spender: `0x${string}`) => {
    try {
      const maxAmount = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

      await writeContract({
        address: PYUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, maxAmount],
      });

      toast.success("Max approval transaction submitted!");
    } catch (error) {
      console.error("Error approving max:", error);
      toast.error("Failed to approve max");
    }
  };

  const approveChimeraMax = async () => {
    return approveMax(CHIMERA_ADDRESS);
  };

  const transfer = async (to: `0x${string}`, amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6);

      await writeContract({
        address: PYUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to, amountWei],
      });

      toast.success("Transfer transaction submitted!");
    } catch (error) {
      console.error("Error transferring:", error);
      toast.error("Failed to transfer");
    }
  };

  // Helper functions
  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0";
    return formatUnits(balance, 6);
  };

  const parseAmount = (amount: string) => {
    return parseUnits(amount, 6);
  };

  const hasAllowance = (allowance: bigint | undefined, requiredAmount: string) => {
    if (!allowance) return false;
    const required = parseUnits(requiredAmount, 6);
    return allowance >= required;
  };

  return {
    // Read hooks
    useBalance,
    useAllowance,
    useChimeraAllowance,
    useTokenInfo,
    
    // Write functions
    approve,
    approveChimera,
    approveMax,
    approveChimeraMax,
    transfer,
    
    // Helper functions
    formatBalance,
    parseAmount,
    hasAllowance,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Constants
    PYUSD_ADDRESS,
    CHIMERA_ADDRESS,
  };
}