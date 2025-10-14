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

  const { address } = useAccount();
  const { useBalance, hasAllowance, approveChimera } = usePYUSD();
  const { data: balance } = useBalance(address);
  const { placeBet, isPending, isConfirming, isConfirmed, hash, useMarket } = useChimeraProtocol();
  const { data: market } = useMarket(parseInt(marketId));

  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

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

    try {
      setIsSubmitting(true);
      await placeBet(parseInt(marketId), optionIndex, betAmount);
      setBetAmount('');
      toast.success('Bet placed successfully!');
    } catch (error: any) {
      console.error('Bet failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return (Number(balance) / 1e6).toFixed(4);
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
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                disabled={isSubmitting || isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white shadow-lg"
                disabled={!isValidAmount || isSubmitting || isPending || !address}
              >
                {isSubmitting || isPending ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Placing Bet...</span>
                  </div>
                ) : (
                  `Place Bet (${betAmount || '0'} PYUSD)`
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};