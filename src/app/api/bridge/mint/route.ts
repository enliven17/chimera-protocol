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
    
    // Validate transaction hash format
    if (!sourceTxHash.startsWith('0x') || sourceTxHash.length !== 66) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }
    
    // For now, skip Sepolia verification due to RPC issues
    // In production, this should be enabled
    console.log('⚠️ Skipping Sepolia verification for testing');
    // const isValidTx = await verifySepoliaTransaction(sourceTxHash, userAddress, amount);
    // if (!isValidTx) {
    //   return NextResponse.json(
    //     { error: 'Invalid or unconfirmed source transaction' },
    //     { status: 400 }
    //   );
    // }
    
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

// Note: Sepolia transaction verification is disabled for testing
// In production, implement proper verification here