"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Loader2,
  ArrowDown,
  Wallet,
  Clock,
  DollarSign,
  Network,
  Copy,
  Check,
  Info
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
  const [copied, setCopied] = useState(false);
  const [bridgeProgress, setBridgeProgress] = useState(0);
  
  // Transaction hooks
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  const { isSuccess: isConfirmed, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });
  
  // Bridge transaction state - use the hash from writeContract
  const { isSuccess: isBridgeConfirmed } = useWaitForTransactionReceipt({ hash });

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentStep === 'approving') {
      setBridgeProgress(25);
    } else if (currentStep === 'approved') {
      setBridgeProgress(50);
    } else if (currentStep === 'bridging') {
      setBridgeProgress(75);
      // Simulate progress during bridging
      interval = setInterval(() => {
        setBridgeProgress(prev => Math.min(prev + 1, 95));
      }, 200);
    } else if (currentStep === 'success') {
      setBridgeProgress(100);
    } else {
      setBridgeProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep]);

  // Handle approval transaction submission
  useEffect(() => {
    if (hash && currentStep === 'approving') {
      console.log('📤 Approval transaction hash:', hash);
      toast.success(`Approval transaction submitted! TX: ${hash.slice(0, 10)}...`);
    }
  }, [hash, currentStep]);

  // Handle approval confirmation
  useEffect(() => {
    if (isConfirmed && currentStep === 'approving') {
      setCurrentStep('approved');
      toast.success('Approval confirmed! You can now proceed with the bridge.');
    }
  }, [isConfirmed, currentStep]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Transaction error:', writeError);
      
      let errorMessage = 'Transaction failed';
      const errorMsg = (writeError as any)?.message || writeError.toString();
      
      if (errorMsg?.includes('User rejected') || errorMsg?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (errorMsg?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fee';
      } else {
        errorMessage = `Transaction failed: ${errorMsg || 'Unknown error'}`;
      }
      
      toast.error(errorMessage);
      
      // Reset to appropriate state
      if (currentStep === 'approving') {
        setCurrentStep('input');
      } else if (currentStep === 'bridging') {
        setCurrentStep('approved');
      }
    }
  }, [writeError, currentStep]);

  // Handle bridge transaction submission
  useEffect(() => {
    if (hash && currentStep === 'bridging') {
      console.log('📤 Bridge transaction hash:', hash);
      toast.success(`Bridge transaction submitted! TX: ${hash.slice(0, 10)}...`);
    }
  }, [hash, currentStep]);

  // Handle bridge confirmation
  useEffect(() => {
    if (isBridgeConfirmed && currentStep === 'bridging' && hash) {
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
              sourceTxHash: hash
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ wPYUSD minted:', result);
            setCurrentStep('success');
            toast.success(`Bridge complete! You received ${amount} wPYUSD on Hedera Testnet.`);
          } else {
            const errorData = await response.json();
            console.warn('⚠️ Bridge operator call failed:', errorData);
            setCurrentStep('success');
            toast.success(`PYUSD locked successfully! wPYUSD will be minted shortly.`);
          }
        } catch (apiError) {
          console.warn('⚠️ Bridge API unavailable, manual processing required:', apiError);
          setCurrentStep('success');
          toast.success(`PYUSD locked successfully! Contact support for manual processing.`);
        }
      }, 2000);
    }
  }, [isBridgeConfirmed, currentStep, address, amount, hash]);
  
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
      writeContract({
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
      const errorMsg = (error as any)?.message || error?.toString() || 'Unknown error';
      
      if (errorMsg.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else if (errorMsg.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fee');
      } else {
        toast.error('Approval failed: ' + errorMsg);
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
      
      writeContract({
        address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'lockTokens',
        args: [amountWei, 'hedera-testnet', address],
      });
      
      // The hash will be available in the `hash` variable from useWriteContract
      // We'll wait for it in the useEffect
      // Transaction will be handled by useWriteContract hook
      toast.success('Bridge transaction submitted! Waiting for confirmation...');
      
    } catch (error) {
      console.error('❌ Bridge failed:', error);
      
      let errorMessage = 'Bridge transaction failed';
      const errorMsg = (error as any)?.message || error?.toString() || 'Unknown error';
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fee. Add some Sepolia ETH to your wallet.';
      } else if (errorMsg.includes('insufficient allowance')) {
        errorMessage = 'Insufficient PYUSD allowance. Please approve again.';
        setCurrentStep('input');
      } else if (errorMsg.includes('ERC20: transfer amount exceeds balance')) {
        errorMessage = 'Insufficient PYUSD balance.';
      } else {
        errorMessage = `Bridge failed: ${errorMsg}`;
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
    <div className="max-w-md mx-auto">
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center space-x-2 text-white text-xl">
            <ArrowRightLeft className="h-6 w-6 text-[#FFE100]" />
            <span>Bridge PYUSD</span>
          </CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            Transfer PYUSD from Ethereum to Hedera seamlessly
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {currentStep !== 'input' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Bridge Progress</span>
                <span>{bridgeProgress}%</span>
              </div>
              <Progress value={bridgeProgress} className="h-2" />
            </div>
          )}

          {/* Wallet Connection */}
          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="p-6 bg-gray-800/30 rounded-lg">
                <Wallet className="h-12 w-12 text-[#FFE100] mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect your wallet to start bridging PYUSD
                </p>
                <ConnectButton />
              </div>
            </div>
          ) : (
            <>
              {/* Connected Wallet Info */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#FFE100] rounded-full flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Connected Wallet</p>
                      <p className="text-gray-400 text-xs">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(address || '')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Network Selection */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Network className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">From</h3>
                          <p className="text-sm text-gray-300">Ethereum Sepolia</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
                        PYUSD
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-[#FFE100] rounded-full p-2">
                      <ArrowDown className="h-4 w-4 text-black" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Network className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">To</h3>
                        <p className="text-sm text-gray-300">Hedera Testnet</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1">
                      wPYUSD
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Amount Input */}
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium text-white flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Amount to Bridge</span>
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFE100] focus:ring-[#FFE100]/20 text-lg h-12 pr-16"
                    disabled={currentStep !== 'input'}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-400 text-sm font-medium">PYUSD</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Available Balance:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white font-medium">
                      {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} PYUSD` : '0 PYUSD'}
                    </span>
                    {balance && parseFloat(formatUnits(balance.value, balance.decimals)) > 0 && (
                      <button
                        onClick={() => setAmount(formatUnits(balance.value, balance.decimals))}
                        className="text-xs text-[#FFE100] hover:text-[#E6CC00] transition-colors"
                        disabled={currentStep !== 'input'}
                      >
                        MAX
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                {balance && parseFloat(formatUnits(balance.value, balance.decimals)) > 0 && currentStep === 'input' && (
                  <div className="flex space-x-2">
                    {[25, 50, 75].map((percentage) => {
                      const maxAmount = parseFloat(formatUnits(balance.value, balance.decimals));
                      const quickAmount = (maxAmount * percentage / 100).toFixed(2);
                      return (
                        <button
                          key={percentage}
                          onClick={() => setAmount(quickAmount)}
                          className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                        >
                          {percentage}%
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bridge Summary */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                    <Info className="h-4 w-4 text-[#FFE100]" />
                    <span>Bridge Summary</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Amount:</span>
                      <span className="text-white font-medium">{amount} PYUSD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Bridge Fee (0.1%):</span>
                      <span className="text-white">{(parseFloat(amount) * 0.001).toFixed(4)} PYUSD</span>
                    </div>
                    <Separator className="bg-gray-600" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">You will receive:</span>
                      <span className="text-[#FFE100] font-medium">
                        {(parseFloat(amount) * 0.999).toFixed(4)} wPYUSD
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Estimated Time:</span>
                      </span>
                      <span className="text-gray-300">2-5 minutes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {chain?.id !== 11155111 && (
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
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep === 'approving' && (
                        <Loader2 className="h-6 w-6 text-[#FFE100] animate-spin" />
                      )}
                      {currentStep === 'approved' && (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      )}
                      {currentStep === 'bridging' && (
                        <Loader2 className="h-6 w-6 text-[#FFE100] animate-spin" />
                      )}
                      {currentStep === 'success' && (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      {currentStep === 'approving' && (
                        <>
                          <p className="font-medium text-white">Approving PYUSD...</p>
                          <p className="text-sm text-gray-400 mt-1">Please confirm the spending cap in your wallet</p>
                          {hash && (
                            <p className="text-xs text-[#FFE100] mt-2">
                              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
                            </p>
                          )}
                        </>
                      )}
                      {currentStep === 'approved' && (
                        <>
                          <p className="font-medium text-white">Approval Confirmed!</p>
                          <p className="text-sm text-gray-400 mt-1">Ready to bridge your PYUSD</p>
                        </>
                      )}
                      {currentStep === 'bridging' && (
                        <>
                          <p className="font-medium text-white">Processing Bridge...</p>
                          <p className="text-sm text-gray-400 mt-1">Your PYUSD is being bridged to Hedera as wPYUSD</p>
                          {hash && (
                            <p className="text-xs text-[#FFE100] mt-2">
                              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
                            </p>
                          )}
                        </>
                      )}
                      {currentStep === 'success' && (
                        <>
                          <p className="font-medium text-white">Bridge Successful! 🎉</p>
                          <p className="text-sm text-gray-400 mt-1">Your wPYUSD is now available on Hedera</p>
                          {hash && (
                            <button
                              onClick={() => copyToClipboard(hash)}
                              className="text-xs text-[#FFE100] hover:text-[#E6CC00] mt-2 flex items-center space-x-1"
                            >
                              <span>TX: {hash.slice(0, 10)}...{hash.slice(-8)}</span>
                              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {currentStep === 'input' && (
                  <Button
                    onClick={handleApprove}
                    disabled={!isValidAmount || !hasEnoughBalance || chain?.id !== 11155111}
                    className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold h-12 text-base"
                  >
                    {chain?.id !== 11155111 ? 'Switch to Sepolia' :
                     !isValidAmount ? 'Enter Amount' :
                     !hasEnoughBalance ? 'Insufficient Balance' :
                     'Approve PYUSD'}
                  </Button>
                )}
                
                {currentStep === 'approving' && (
                  <Button
                    disabled
                    className="w-full bg-gray-600 text-gray-300 cursor-not-allowed h-12"
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isWritePending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Waiting for Approval...'}
                  </Button>
                )}
                
                {currentStep === 'approved' && (
                  <Button
                    onClick={handleBridge}
                    className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold h-12 text-base"
                  >
                    Start Bridge
                  </Button>
                )}
                
                {currentStep === 'bridging' && (
                  <Button
                    disabled
                    className="w-full bg-gray-600 text-gray-300 cursor-not-allowed h-12"
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isWritePending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Processing...'}
                  </Button>
                )}
                
                {currentStep === 'success' && (
                  <div className="space-y-3">
                    <Button
                      onClick={resetForm}
                      className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold h-12 text-base"
                    >
                      Bridge More PYUSD
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 h-12"
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
              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">
                  Need help? Check our{' '}
                  <a href="/learn" className="text-[#FFE100] hover:text-[#E6CC00] transition-colors">
                    bridge guide
                  </a>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}