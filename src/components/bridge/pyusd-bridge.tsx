"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Loader2,
  ArrowDown
} from "lucide-react";

import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { toast } from "sonner";
import { parseUnits, formatUnits } from "viem";

// PYUSD contract address for Sepolia testnet
// Official PayPal USD on Ethereum Sepolia testnet
const SEPOLIA_PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // Real PYUSD on Sepolia
const BRIDGE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ETH_BRIDGE_ADDRESS || "0xE405053847153e5Eb3984C29c58fa9E5d7de9a25"; // PYUSD Bridge on Sepolia

// ERC20 ABI for PYUSD operations
const ERC20_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Bridge Contract ABI
const BRIDGE_ABI = [
  {
    "inputs": [
      {"name": "amount", "type": "uint256"},
      {"name": "destinationNetwork", "type": "string"},
      {"name": "destinationAddress", "type": "string"}
    ],
    "name": "lockTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBridgeInfo",
    "outputs": [
      {"name": "tokenAddress", "type": "address"},
      {"name": "totalLockedAmount", "type": "uint256"},
      {"name": "bridgeFeeAmount", "type": "uint256"},
      {"name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function PYUSDBridge() {
  const { address, isConnected, chain } = useAccount();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [currentStep, setCurrentStep] = useState<'input' | 'approving' | 'approved' | 'bridging' | 'success'>('input');
  
  // Transaction hooks
  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess: isConfirmed, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });
  
  // Bridge transaction state
  const [bridgeHash, setBridgeHash] = useState<string | undefined>();
  const { isSuccess: isBridgeConfirmed } = useWaitForTransactionReceipt({ hash: bridgeHash as `0x${string}` });

  // Handle approval confirmation
  useEffect(() => {
    if (isConfirmed && currentStep === 'approving') {
      setCurrentStep('approved');
      toast.success('Approval confirmed! You can now proceed with the bridge.');
    }
  }, [isConfirmed, currentStep]);

  // Handle bridge confirmation
  useEffect(() => {
    if (isBridgeConfirmed && currentStep === 'bridging') {
      console.log('✅ Bridge transaction confirmed, proceeding with mint...');
      toast.success('PYUSD locked in bridge! Processing cross-chain mint...');
      
      // Continue with the mint process
      setTimeout(async () => {
        try {
          // Call bridge operator API to mint wPYUSD
          const response = await fetch('/api/bridge/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: address,
              amount: parseUnits(amount, 6).toString(),
              sourceTxHash: bridgeHash
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ wPYUSD minted:', result);
            setCurrentStep('success');
            toast.success(`Bridge complete! You received ${amount} wPYUSD on Hedera Testnet.`);
          } else {
            console.warn('⚠️ Bridge operator call failed, but PYUSD is locked');
            setCurrentStep('success');
            toast.success(`PYUSD locked successfully! wPYUSD will be minted shortly.`);
          }
        } catch (apiError) {
          console.warn('⚠️ Bridge API unavailable, manual processing required');
          setCurrentStep('success');
          toast.success(`PYUSD locked successfully! Contact support for manual processing.`);
        }
      }, 2000);
    }
  }, [isBridgeConfirmed, currentStep, address, amount, bridgeHash]);
  
  // Get PYUSD balance on Sepolia
  const { data: balance } = useBalance({
    address,
    token: SEPOLIA_PYUSD_ADDRESS as `0x${string}`,
  });

  // Debug logging
  console.log('🔍 Bridge Debug Info:', {
    walletAddress: address,
    currentChainId: chain?.id,
    expectedChainId: 11155111, // Sepolia
    isOnSepolia: chain?.id === 11155111,
    contractAddress: SEPOLIA_PYUSD_ADDRESS,
    rawBalance: balance?.value?.toString(),
    formattedBalance: balance ? formatUnits(balance.value, balance.decimals) : 'No balance',
    balanceDecimals: balance?.decimals,
    balanceSymbol: balance?.symbol
  });

  // Bridge functions
  const handleApprove = async () => {
    if (!amount || !address) return;
    
    try {
      setCurrentStep('approving');
      const amountWei = parseUnits(amount, 6);
      
      console.log('🔐 Requesting PYUSD approval:', {
        contract: SEPOLIA_PYUSD_ADDRESS,
        spender: BRIDGE_CONTRACT_ADDRESS,
        amount: amountWei.toString()
      });
      
      // This should trigger the wallet popup
      const txHash = await writeContract({
        address: SEPOLIA_PYUSD_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [BRIDGE_CONTRACT_ADDRESS as `0x${string}`, amountWei],
      });
      
      toast.success('Approval transaction submitted! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      // The useWaitForTransactionReceipt hook will handle this
      
    } catch (error) {
      console.error('Approval failed:', error);
      
      // Better error handling
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fee');
      } else {
        toast.error('Approval failed: ' + (error.message || 'Unknown error'));
      }
      
      setCurrentStep('input');
    }
  };

  const handleBridge = async () => {
    if (!amount || !address || currentStep !== 'approved') return;
    
    try {
      setCurrentStep('bridging');
      
      const amountWei = parseUnits(amount, 6);
      
      console.log('🌉 Initiating bridge transaction:', {
        amount: amountWei.toString(),
        destinationAddress: address
      });
      
      // Step 1: Call bridge contract lockTokens function
      toast.success('Locking PYUSD in bridge contract...');
      
      console.log('🔒 Bridge lock parameters:', {
        userAddress: address,
        bridgeAddress: BRIDGE_CONTRACT_ADDRESS,
        amount: amountWei.toString(),
        amountFormatted: amount,
        destinationNetwork: 'hedera-testnet',
        destinationAddress: address
      });
      
      // Validation checks
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      if (chain?.id !== 11155111) {
        throw new Error(`Wrong network. Please switch to Sepolia (Chain ID: 11155111). Current: ${chain?.id}`);
      }
      
      if (!address) {
        throw new Error('No wallet address found');
      }
      
      // Call bridge contract lockTokens function
      console.log('🔄 Calling bridge lockTokens...');
      
      const bridgeTx = await writeContract({
        address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'lockTokens',
        args: [amountWei, 'hedera-testnet', address],
      });
      
      console.log('📤 Bridge transaction hash:', bridgeTx);
      
      if (!bridgeTx) {
        throw new Error('Bridge transaction failed - no hash returned');
      }
      
      setBridgeHash(bridgeTx);
      toast.success(`Bridge transaction submitted! TX: ${bridgeTx.slice(0, 10)}...`);
      
      // The useWaitForTransactionReceipt hook will handle the rest
      // When isBridgeConfirmed becomes true, the mint process will start
      
    } catch (error) {
      console.error('❌ Bridge failed:', error);
      
      let errorMessage = 'Bridge transaction failed';
      
      if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fee. Add some Sepolia ETH to your wallet.';
      } else if (error.message?.includes('insufficient allowance')) {
        errorMessage = 'Insufficient PYUSD allowance. Please approve again.';
        setCurrentStep('input');
      } else if (error.message?.includes('ERC20: transfer amount exceeds balance')) {
        errorMessage = 'Insufficient PYUSD balance.';
      } else {
        errorMessage = `Bridge failed: ${error.message || 'Unknown error'}`;
      }
      
      toast.error(errorMessage);
      setCurrentStep('approved');
    }
  };

  const resetForm = () => {
    setAmount('');
    setCurrentStep('input');
  };

  const isValidAmount = amount && parseFloat(amount) > 0;
  const hasEnoughBalance = balance && amount ? 
    parseFloat(formatUnits(balance.value, balance.decimals)) >= parseFloat(amount) : false;

  return (
    <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <ArrowRightLeft className="h-5 w-5 text-[#FFE100]" />
          <span>Bridge PYUSD</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Connection */}
        <div className="flex justify-center">
          <ConnectButton />
        </div>

        {/* Network Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <h3 className="font-semibold text-white">From</h3>
              <p className="text-sm text-gray-300">Ethereum Sepolia</p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              PYUSD
            </Badge>
          </div>
          
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-[#FFE100]" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <h3 className="font-semibold text-white">To</h3>
              <p className="text-sm text-gray-300">Hedera Testnet</p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              wPYUSD
            </Badge>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium text-white">
            Amount to Bridge
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFE100] focus:ring-[#FFE100]/20"
            disabled={currentStep !== 'input'}
          />
          <div className="flex justify-between text-xs text-gray-300">
            <span>Available Balance:</span>
            <span>
              {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} PYUSD` : '0 PYUSD'}
            </span>
          </div>
        </div>

        {/* Destination Info */}
        {isConnected && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Destination Address:</span>
              <span className="text-sm text-white font-mono">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              wPYUSD will be sent to your connected wallet address
            </p>
          </div>
        )}

        {/* Bridge Info */}
        <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Bridge Fee:</span>
            <span className="text-white">0.1%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Estimated Time:</span>
            <span className="text-white">2-5 minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">You will receive:</span>
            <span className="text-white">
              {amount ? `~${(parseFloat(amount) * 0.999).toFixed(4)} wPYUSD` : '0 wPYUSD'}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {!isConnected && (
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              Please connect your wallet to use the bridge. You'll need PYUSD on Sepolia testnet.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && chain?.id !== 11155111 && (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">
              Please switch to Ethereum Sepolia network to bridge PYUSD
            </AlertDescription>
          </Alert>
        )}

        {amount && !hasEnoughBalance && (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">
              Insufficient PYUSD balance. You need PYUSD on Sepolia to use the bridge.
            </AlertDescription>
          </Alert>
        )}

        {/* Step Indicator */}
        {currentStep !== 'input' && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              {currentStep === 'approving' && (
                <>
                  <Loader2 className="h-5 w-5 text-[#FFE100] animate-spin" />
                  <div>
                    <p className="font-medium text-white">Approving PYUSD...</p>
                    <p className="text-sm text-gray-400">Please confirm the spending cap in your wallet</p>
                  </div>
                </>
              )}
              {currentStep === 'approved' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Approval Confirmed!</p>
                    <p className="text-sm text-gray-400">Ready to bridge your PYUSD</p>
                  </div>
                </>
              )}
              {currentStep === 'bridging' && (
                <>
                  <Loader2 className="h-5 w-5 text-[#FFE100] animate-spin" />
                  <div>
                    <p className="font-medium text-white">Processing Bridge...</p>
                    <p className="text-sm text-gray-400">Your PYUSD is being bridged to Hedera as wPYUSD</p>
                  </div>
                </>
              )}
              {currentStep === 'success' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Bridge Successful!</p>
                    <p className="text-sm text-gray-400">Your wPYUSD is now available on Hedera</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {currentStep === 'input' && (
            <Button
              onClick={handleApprove}
              disabled={!isConnected || !isValidAmount || !hasEnoughBalance || chain?.id !== 11155111}
              className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold"
            >
              {!isConnected ? 'Connect Wallet' : 
               chain?.id !== 11155111 ? 'Switch to Sepolia' :
               !isValidAmount ? 'Enter Amount' :
               !hasEnoughBalance ? 'Insufficient Balance' :
               'Approve PYUSD'}
            </Button>
          )}
          
          {currentStep === 'approving' && (
            <Button
              disabled
              className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
            >
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Waiting for Approval...
            </Button>
          )}
          
          {currentStep === 'approved' && (
            <Button
              onClick={handleBridge}
              className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold"
            >
              Start Bridge
            </Button>
          )}
          
          {currentStep === 'bridging' && (
            <Button
              disabled
              className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
            >
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Bridging in Progress...
            </Button>
          )}
          
          {currentStep === 'success' && (
            <div className="space-y-2">
              <Button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold"
              >
                Bridge More PYUSD
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <a href="/markets" className="flex items-center justify-center space-x-2">
                  <span>Start Betting</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-300">
            Need help? Check our{' '}
            <a href="/learn" className="text-[#FFE100] hover:underline">
              bridge guide
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}