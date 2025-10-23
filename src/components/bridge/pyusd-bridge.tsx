"use client";

import { useState } from "react";
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
// Using USDC on Sepolia as a proxy for PYUSD testing since official PYUSD may not be on Sepolia
// Users can get test USDC from: https://faucet.circle.com/
const SEPOLIA_PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC on Sepolia (6 decimals)
const BRIDGE_CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"; // Mock bridge contract

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

export function PYUSDBridge() {
  const { address, isConnected, chain } = useAccount();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [currentStep, setCurrentStep] = useState<'input' | 'approve' | 'bridge' | 'success'>('input');
  
  // Transaction hooks
  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  // Get PYUSD balance (mock for demo)
  const { data: balance } = useBalance({
    address,
    token: SEPOLIA_PYUSD_ADDRESS as `0x${string}`,
  });

  // Bridge functions
  const handleApprove = async () => {
    if (!amount || !address) return;
    
    try {
      setCurrentStep('approve');
      const amountWei = parseUnits(amount, 6);
      
      writeContract({
        address: SEPOLIA_PYUSD_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [BRIDGE_CONTRACT_ADDRESS as `0x${string}`, amountWei],
      });
      
      toast.success('USDC approval transaction submitted!');
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Approval failed');
      setCurrentStep('input');
    }
  };

  const handleBridge = async () => {
    if (!amount || !address) return;
    
    try {
      setCurrentStep('bridge');
      
      // Mock bridge transaction (in real implementation, this would call bridge contract)
      toast.success('Bridge transaction initiated!');
      
      // Simulate bridge processing
      setTimeout(() => {
        setCurrentStep('success');
        toast.success(`Successfully bridged ${amount} USDC to Hedera as wPYUSD!`);
      }, 3000);
      
    } catch (error) {
      console.error('Bridge failed:', error);
      toast.error('Bridge transaction failed');
      setCurrentStep('input');
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
              USDC (Test)
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
              {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} USDC` : '0 USDC'}
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
              Please connect your wallet to use the bridge. You'll need test USDC from{' '}
              <a 
                href="https://faucet.circle.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Circle Faucet
              </a>
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
              Insufficient USDC balance. Get test USDC from{' '}
              <a 
                href="https://faucet.circle.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Circle Faucet
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Step Indicator */}
        {currentStep !== 'input' && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              {currentStep === 'approve' && (
                <>
                  <Loader2 className="h-5 w-5 text-[#FFE100] animate-spin" />
                  <div>
                    <p className="font-medium text-white">Approving USDC...</p>
                    <p className="text-sm text-gray-400">Please confirm the approval in your wallet</p>
                  </div>
                </>
              )}
              {currentStep === 'bridge' && (
                <>
                  <Loader2 className="h-5 w-5 text-[#FFE100] animate-spin" />
                  <div>
                    <p className="font-medium text-white">Processing Bridge...</p>
                    <p className="text-sm text-gray-400">Your USDC is being bridged to Hedera as wPYUSD</p>
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
               'Start Bridge'}
            </Button>
          )}
          
          {currentStep === 'approve' && isConfirmed && (
            <Button
              onClick={handleBridge}
              className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold"
            >
              Confirm Bridge
            </Button>
          )}
          
          {currentStep === 'success' && (
            <div className="space-y-2">
              <Button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black font-semibold"
              >
                Bridge More USDC
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