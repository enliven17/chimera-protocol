#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CHIMERA_ABI = [
  "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool))",
  "function resolveMarket(uint256 marketId, uint8 outcome) external",
  "function resolvePriceMarket(uint256 marketId, bytes[] calldata priceUpdateData) external payable"
];

const PYTH_ABI = [
  "function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount)"
];

async function main() {
  const marketId = "3"; // Market ID to resolve
  
  console.log(`🔄 Resolving Market ID: ${marketId}...`);

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`📍 Using wallet: ${wallet.address}`);

  // Get the deployed contract
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  if (!chimeraAddress) {
    throw new Error("NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS not set in .env");
  }

  // Get ChimeraProtocol contract
  const chimera = new ethers.Contract(chimeraAddress, CHIMERA_ABI, wallet);

  try {
    // Get market details first
    const market = await chimera.getMarket(marketId);
    console.log("\n📋 Market Details:");
    console.log("  - Title:", market.title);
    console.log("  - Option A:", market.optionA);
    console.log("  - Option B:", market.optionB);
    console.log("  - Resolved:", market.resolved);
    console.log("  - Status:", market.status);

    if (market.resolved) {
      console.log("⚠️ Market is already resolved!");
      return;
    }

    // This is a price market, we need to use resolvePriceMarket with Pyth price data
    console.log("\n🔄 This is a price market, fetching Pyth price data...");
    
    // Import Pyth connection
    const { EvmPriceServiceConnection } = await import('@pythnetwork/pyth-evm-js');
    const connection = new EvmPriceServiceConnection('https://hermes.pyth.network');
    
    // ETH/USD price ID
    const ethPriceId = '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
    
    // Get price update data
    const priceUpdateData = await connection.getPriceFeedsUpdateData([ethPriceId]);
    console.log("✅ Price update data fetched");
    
    // Get Pyth contract to calculate update fee
    const pythAddress = process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS;
    const pythContract = new ethers.Contract(pythAddress, PYTH_ABI, wallet);
    
    const updateFee = await pythContract.getUpdateFee(priceUpdateData);
    console.log(`💰 Update fee: ${ethers.formatEther(updateFee)} HBAR`);
    
    console.log(`\n🔄 Resolving price market with current ETH price...`);
    
    const tx = await chimera.resolvePriceMarket(marketId, priceUpdateData, {
      value: updateFee
    });
    console.log("📤 Transaction sent:", tx.hash);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log("✅ Market resolved successfully!");
    console.log("📦 Block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    console.log("🔗 Transaction:", `https://hashscan.io/testnet/transaction/${tx.hash}`);

    // Get updated market details
    const updatedMarket = await chimera.getMarket(marketId);
    console.log("\n📋 Updated Market Status:");
    console.log("  - Resolved:", updatedMarket.resolved);
    console.log("  - Outcome:", updatedMarket.outcome.toString());
    console.log("  - Winner:", updatedMarket.outcome === 0 ? updatedMarket.optionA : updatedMarket.optionB);

  } catch (error) {
    console.error("❌ Error resolving market:", error);
    
    if (error.message.includes("Market not found")) {
      console.log("💡 Market ID might not exist. Check available markets.");
    } else if (error.message.includes("Only creator")) {
      console.log("💡 Only the market creator can resolve this market.");
    } else if (error.message.includes("Market not ended")) {
      console.log("💡 Market hasn't ended yet. Wait for end time.");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });