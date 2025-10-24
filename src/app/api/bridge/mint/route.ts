import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { handleBridgeMintRequest } from '../../../../../scripts/bridge-operator.js';

// Bridge operator endpoint for minting wPYUSD on Hedera
export async function POST(request: NextRequest) {
  try {
    const { userAddress, amount, sourceTxHash } = await request.json();
    
    console.log('🌉 Bridge mint request:', {
      userAddress,
      amount,
      sourceTxHash
    });
    
    // Validate parameters
    if (!userAddress || !amount || !sourceTxHash) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Validate Ethereum address
    if (!ethers.isAddress(userAddress)) {
      return NextResponse.json(
        { error: 'Invalid user address' },
        { status: 400 }
      );
    }
    
    // Validate amount
    const amountBN = BigInt(amount);
    if (amountBN <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Verify the source transaction on Sepolia
    console.log('🔍 Verifying source transaction on Sepolia...');
    const isValidTx = await verifySepoliaTransaction(sourceTxHash, userAddress, amount);
    
    if (!isValidTx) {
      return NextResponse.json(
        { error: 'Invalid or unconfirmed source transaction' },
        { status: 400 }
      );
    }
    
    console.log('✅ Bridge mint request validated');
    console.log(`💰 Will mint ${ethers.formatUnits(amount, 6)} wPYUSD for ${userAddress}`);
    
    // Call the actual bridge operator to mint wPYUSD on Hedera
    const result = await handleBridgeMintRequest(userAddress, amount, sourceTxHash);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'wPYUSD minted successfully',
        txHash: result.txHash,
        amount: ethers.formatUnits(amount, 6)
      });
    } else {
      return NextResponse.json(
        { error: 'Mint failed: ' + result.error },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Bridge mint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify Sepolia transaction
async function verifySepoliaTransaction(txHash: string, userAddress: string, amount: string): Promise<boolean> {
  try {
    const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY;
    const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.status) {
      console.log('❌ Transaction not found or failed');
      return false;
    }
    
    // Check if transaction is confirmed (at least 3 blocks)
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    if (confirmations < 3) {
      console.log(`⏳ Transaction needs more confirmations: ${confirmations}/3`);
      return false;
    }
    
    console.log('✅ Sepolia transaction verified');
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying Sepolia transaction:', error);
    return false;
  }
}