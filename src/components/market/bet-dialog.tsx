import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useChimeraProtocol } from '@/hooks/useChimeraProtocol';
import { usePYUSD } from '@/hooks/usePYUSD';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface BetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: string;
  marketTitle: string;
  selectedSide: 'optionA' | 'optionB';
  optionA: string;
  optionB: string;
  onSuccess?: () => void;
}

export const BetDialog: React.FC<BetDialogProps> = ({
  open,
  onOpenChange,
  marketId,
  marketTitle,
  selectedSide,
  optionA,
  optionB,
  onSuccess
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { address, isConnected, chain } = useAccount();
  const { 
    useBalance, 
    useChimeraAllowance, 
    useTokenInfo,
    hasAllowance, 
    approveChimera, 
    formatBalance: formatPYUSDBalance,
    isPending: isApprovePending,
    isConfirming: isApproveConfirming 
  } = usePYUSD();
  const { data: balance } = useBalance(address);
  const { data: allowance } = useChimeraAllowance(address);
  const { placeBet, isPending, isConfirming, isConfirmed, hash, useMarket } = useChimeraProtocol();
  const { data: market } = useMarket(parseInt(marketId));

  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

  // Handle successful transactions
  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Bet placed successfully!');
      setBetAmount('');
      onSuccess?.();
      onOpenChange(false);
    }
  }, [isConfirmed, hash, onSuccess, onOpenChange]);

  // Check if user has enough balance
  const hasEnoughBalance = balance && betAmount ? 
    parseFloat(formatPYUSDBalance(balance)) >= parseFloat(betAmount) : false;

  // Check if user has enough allowance
  const hasEnoughAllowance = allowance && betAmount ? 
    hasAllowance(allowance, betAmount) : false;

  const needsApproval = betAmount && parseFloat(betAmount) > 0 && !hasEnoughAllowance;

  const handleApprove = async () => {
    if (!betAmount) return;
    
    try {
      setIsSubmitting(true);
      await approveChimera(betAmount);
      toast.success('Approval transaction submitted! Please wait for confirmation.');
    } catch (error: any) {
      console.error('Approval failed:', error);
      toast.error('Approval failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Insufficient PYUSD balance');
      return;
    }

    if (needsApproval) {
      toast.error('Please approve PYUSD spending first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('🔗 Wallet Status:', {
        address,
        isConnected,
        chainId: chain?.id,
        chainName: chain?.name
      });
      
      console.log('🎯 Placing bet:', { marketId, optionIndex, betAmount, address });
      
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      if (chain?.id !== 296) {
        throw new Error(`Wrong network. Expected Hedera Testnet (296), got ${chain?.id}`);
      }
      
      await placeBet(parseInt(marketId), optionIndex, betAmount);
      
      console.log('✅ Bet transaction submitted successfully');
      toast.success('Bet transaction submitted! Please wait for confirmation.');
    } catch (error: any) {
      console.error('❌ Bet failed:', error);
      
      // More detailed error handling
      let errorMessage = 'Unknown error';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.code) {
        errorMessage = `Error code: ${error.code}`;
      }
      
      toast.error('Bet failed: ' + errorMessage);
      
      // Log full error for debugging
      console.log('Full error object:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return formatPYUSDBalance(balance);
  };

  const isValidAmount = betAmount && parseFloat(betAmount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-[#eab308]" />
            <span>Place Bet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-300">Market</h3>
            <p className="text-white font-medium">{marketTitle}</p>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-300">Your Prediction</h3>
            <Badge className={`${
              selectedSide === 'optionA'
                ? 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30'
                : 'bg-gray-600/20 text-gray-300 border-gray-600/30'
            } font-medium`}>
              {selectedOption}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="betAmount" className="text-sm font-medium text-gray-300">
                Bet Amount (PYUSD)
              </Label>
              <Input
                id="betAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                disabled={isSubmitting || isPending}
              />

              <div className="flex justify-between text-xs text-gray-400">
                <span>Available Balance:</span>
                <span>{formatBalance(balance)} PYUSD</span>
              </div>
              
              {/* Status info */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="text-xs text-gray-400 mt-1 space-y-1">
                  <div>Balance: {balance ? formatPYUSDBalance(balance) : 'Loading...'} wPYUSD</div>
                  <div>Status: {hasEnoughBalance ? '✅ Sufficient balance' : '❌ Insufficient balance'}</div>
                  {hasEnoughBalance && (
                    <div>Approval: {needsApproval ? '⏳ Required' : '✅ Ready'}</div>
                  )}
                </div>
              )}

              {/* Balance and Allowance Status */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="space-y-1">
                  {!hasEnoughBalance && (
                    <div className="flex items-center space-x-2 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Insufficient balance</span>
                    </div>
                  )}
                  {hasEnoughBalance && needsApproval && (
                    <div className="flex items-center space-x-2 text-yellow-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Approval required</span>
                    </div>
                  )}
                  {hasEnoughBalance && !needsApproval && (
                    <div className="flex items-center space-x-2 text-green-400 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Ready to bet</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                disabled={isSubmitting || isPending || isApprovePending}
              >
                Cancel
              </Button>

              {needsApproval ? (
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  disabled={!isValidAmount || isSubmitting || isApprovePending || !address || !hasEnoughBalance}
                >
                  {isSubmitting || isApprovePending || isApproveConfirming ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Approving...</span>
                    </div>
                  ) : (
                    `Approve ${betAmount || '0'} PYUSD`
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black shadow-lg font-semibold"
                  disabled={!isValidAmount || isSubmitting || isPending || !address || !hasEnoughBalance || needsApproval}
                >
                  {isSubmitting || isPending || isConfirming ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Placing Bet...</span>
                    </div>
                  ) : (
                    `Place Bet (${betAmount || '0'} PYUSD)`
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};