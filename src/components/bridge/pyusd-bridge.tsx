"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Bridge, 
  ArrowRightLeft, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Activity,
  Shield
} from "lucide-react";

import { 
  usePYUSDBridgeDashboard,
  usePYUSDInitiateBridgeTransfer,
  usePYUSDInitiateReverseBridgeTransfer,
  usePYUSDValidateTransfer,
  usePYUSDTransferTimeEstimate,
  usePYUSDRealTimeTransfers,
  calculateBridgeFee,
  formatTransferStatus
} from "@/hooks/usePYUSDBridge";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export function PYUSDBridge() {
  const { address, isConnected } = useAccount();
  
  // Form state
  const [transferDirection, setTransferDirection] = useState<'ethToHedera' | 'hederaToEth'>('ethToHedera');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  
  // Hooks
  const bridgeDashboard = usePYUSDBridgeDashboard(address);
  const initiateBridgeTransfer = usePYUSDInitiateBridgeTransfer();
  const initiateReverseBridgeTransfer = usePYUSDInitiateReverseBridgeTransfer();
  const validateTransfer = usePYUSDValidateTransfer();
  const timeEstimate = usePYUSDTransferTimeEstimate(
    transferDirection === 'ethToHedera' ? 'ethereum-sepolia' : 'hedera-testnet',
    transferDirection === 'ethToHedera' ? 'hedera-testnet' : 'ethereum-sepolia'
  );
  const realTimeTransfers = usePYUSDRealTimeTransfers(address || '');

  const handleTransferDirectionChange = () => {
    setTransferDirection(prev => prev === 'ethToHedera' ? 'hederaToEth' : 'ethToHedera');
    setDestinationAddress('');
  };

  const handleValidateTransfer = async () => {
    if (!amount || !destinationAddress || !address) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await validateTransfer.mutateAsync({
        amount,
        fromNetwork: transferDirection === 'ethToHedera' ? 'ethereum-sepolia' : 'hedera-testnet',
        toNetwork: transferDirection === 'ethToHedera' ? 'hedera-testnet' : 'ethereum-sepolia',
        userAddress: address,
      });
      toast.success('Transfer parameters validated successfully');
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleInitiateTransfer = async () => {
    if (!amount || !destinationAddress || !address) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (transferDirection === 'ethToHedera') {
        await initiateBridgeTransfer.mutateAsync({
          amount,
          hederaAddress: destinationAddress,
          userAddress: address,
        });
      } else {
        await initiateReverseBridgeTransfer.mutateAsync({
          amount,
          ethereumAddress: destinationAddress,
          userAddress: address,
        });
      }
      
      // Reset form
      setAmount('');
      setDestinationAddress('');
    } catch (error) {
      console.error('Transfer initiation error:', error);
    }
  };

  const estimatedFee = bridgeDashboard.info ? 
    calculateBridgeFee(amount || '0', bridgeDashboard.info as any, transferDirection) : '0';

  const isLoading = initiateBridgeTransfer.isPending || 
                   initiateReverseBridgeTransfer.isPending || 
                   validateTransfer.isPending;

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardContent className="p-6">
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Please connect your wallet to use the PYUSD Bridge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bridge className="h-6 w-6 text-orange-400" />
          <h1 className="text-2xl font-bold text-white">PYUSD Bridge</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${
            bridgeDashboard.info?.isActive 
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {bridgeDashboard.info?.isActive ? 'Bridge Active' : 'Bridge Inactive'}
          </Badge>
          <Button
            onClick={() => bridgeDashboard.refetch()}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bridge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Total Volume</p>
                <p className="text-xl font-bold text-white">
                  ${bridgeDashboard.stats?.totalVolume ? parseFloat(bridgeDashboard.stats.totalVolume).toFixed(0) : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Total Transfers</p>
                <p className="text-xl font-bold text-white">
                  {bridgeDashboard.stats?.totalTransfers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-xl font-bold text-white">
                  {bridgeDashboard.stats?.successRate.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Avg Time</p>
                <p className="text-xl font-bold text-white">
                  {bridgeDashboard.stats ? Math.round(bridgeDashboard.stats.averageTransferTime / 60) : 0}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bridge Transfer Form */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <ArrowRightLeft className="h-5 w-5 text-orange-400" />
            <span>Bridge Transfer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Direction Selector */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 p-2 bg-[#0A0C14] rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-400">From</p>
                <p className="text-white font-medium">
                  {transferDirection === 'ethToHedera' ? 'Ethereum Sepolia' : 'Hedera Testnet'}
                </p>
              </div>
              <Button
                onClick={handleTransferDirectionChange}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-400">To</p>
                <p className="text-white font-medium">
                  {transferDirection === 'ethToHedera' ? 'Hedera Testnet' : 'Ethereum Sepolia'}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Amount (PYUSD)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0A0C14] border-gray-700 text-white placeholder-gray-500 focus:border-orange-400"
            />
            {amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Fee:</span>
                <span className="text-white">${estimatedFee} PYUSD</span>
              </div>
            )}
          </div>

          {/* Destination Address */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-gray-300">
              Destination Address ({transferDirection === 'ethToHedera' ? 'Hedera' : 'Ethereum'})
            </Label>
            <Input
              id="destination"
              placeholder={transferDirection === 'ethToHedera' ? '0.0.123456' : '0x...'}
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="bg-[#0A0C14] border-gray-700 text-white placeholder-gray-500 focus:border-orange-400"
            />
          </div>

          {/* Transfer Summary */}
          {amount && destinationAddress && (
            <div className="p-4 bg-[#0A0C14] rounded-lg border border-gray-800/50">
              <h4 className="font-semibold text-white mb-3">Transfer Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">{amount} PYUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bridge Fee:</span>
                  <span className="text-white">{estimatedFee} PYUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You'll Receive:</span>
                  <span className="text-white font-bold">
                    {(parseFloat(amount) - parseFloat(estimatedFee)).toFixed(6)} PYUSD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="text-white">
                    {timeEstimate.data ? `${Math.round(timeEstimate.data.estimatedMinutes)} minutes` : 'Calculating...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleValidateTransfer}
              variant="outline"
              disabled={!amount || !destinationAddress || isLoading}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {validateTransfer.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Validate
            </Button>
            <Button
              onClick={handleInitiateTransfer}
              disabled={!amount || !destinationAddress || isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bridge className="h-4 w-4 mr-2" />
              )}
              Initiate Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Transfers */}
      {realTimeTransfers.pendingTransfers && realTimeTransfers.pendingTransfers.length > 0 && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Clock className="h-5 w-5 text-orange-400" />
              <span>Pending Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {realTimeTransfers.pendingTransfers.map((transfer) => {
              const statusInfo = formatTransferStatus(transfer.status);
              return (
                <div key={transfer.id} className="p-4 bg-[#0A0C14] rounded-lg border border-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{transfer.amount} PYUSD</p>
                      <p className="text-gray-400 text-sm">
                        {transfer.fromNetwork} → {transfer.toNetwork}
                      </p>
                    </div>
                    <Badge className={`bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400 border-${statusInfo.color}-500/30`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress:</span>
                      <span className="text-white">{transfer.currentStep}/{transfer.totalSteps}</span>
                    </div>
                    <Progress 
                      value={(parseInt(transfer.currentStep) / transfer.totalSteps) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">ETA:</span>
                      <span className="text-white">{transfer.estimatedCompletionTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">
                        {transfer.sourceTxHash.slice(0, 10)}...{transfer.sourceTxHash.slice(-8)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => window.open(`https://etherscan.io/tx/${transfer.sourceTxHash}`, '_blank')}
                    >
                      View Tx
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Transfer History */}
      {bridgeDashboard.transferHistory && bridgeDashboard.transferHistory.length > 0 && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Activity className="h-5 w-5 text-orange-400" />
              <span>Recent Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bridgeDashboard.transferHistory.slice(0, 5).map((transfer) => {
              const statusInfo = formatTransferStatus(transfer.status);
              return (
                <div key={transfer.id} className="flex items-center justify-between p-3 bg-[#0A0C14] rounded-lg">
                  <div>
                    <p className="text-white font-medium">{transfer.amount} PYUSD</p>
                    <p className="text-gray-400 text-sm">
                      {transfer.fromNetwork} → {transfer.toNetwork}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(transfer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400 border-${statusInfo.color}-500/30 mb-1`}>
                      {statusInfo.label}
                    </Badge>
                    <p className="text-gray-400 text-xs">Fee: ${transfer.fee}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Bridge Liquidity */}
      {bridgeDashboard.liquidity && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <span>Bridge Liquidity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Ethereum Side</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white">${parseFloat(bridgeDashboard.liquidity.ethSide.available).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Locked:</span>
                    <span className="text-white">${parseFloat(bridgeDashboard.liquidity.ethSide.locked).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white">${parseFloat(bridgeDashboard.liquidity.ethSide.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Hedera Side</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white">${parseFloat(bridgeDashboard.liquidity.hederaSide.available).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minted:</span>
                    <span className="text-white">${parseFloat(bridgeDashboard.liquidity.hederaSide.minted).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white">${parseFloat(bridgeDashboard.liquidity.hederaSide.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Utilization Rate:</span>
                <span className="text-white font-bold">{bridgeDashboard.liquidity.utilizationRate.toFixed(1)}%</span>
              </div>
              <Progress 
                value={bridgeDashboard.liquidity.utilizationRate} 
                className="h-2 mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}