#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const BRIDGE_CONTRACT_ADDRESS = process.env.BRIDGE_CONTRACT_ADDRESS;
const USER_ADDRESS = "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const BRIDGE_ABI = [
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
  },
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
  }
];

async function testBridge() {
  try {
    console.log('🧪 Testing PYUSD Bridge...');
    console.log(`🌉 Bridge Address: ${BRIDGE_CONTRACT_ADDRESS}`);
    console.log(`👤 User Address: ${USER_ADDRESS}`);
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // Connect to contracts
    const pyusdContract = new ethers.Contract(SEPOLIA_PYUSD_ADDRESS, ERC20_ABI, provider);
    const bridgeContract = new ethers.Contract(BRIDGE_CONTRACT_ADDRESS, BRIDGE_ABI, provider);
    
    // Get token info
    const symbol = await pyusdContract.symbol();
    const decimals = await pyusdContract.decimals();
    
    console.log(`📄 Token: ${symbol} (${decimals} decimals)`);
    
    // Check bridge info
    console.log('\n🔍 Bridge Information:');
    const bridgeInfo = await bridgeContract.getBridgeInfo();
    console.log(`  Token Address: ${bridgeInfo.tokenAddress}`);
    console.log(`  Total Locked: ${ethers.formatUnits(bridgeInfo.totalLockedAmount, decimals)} ${symbol}`);
    console.log(`  Bridge Fee: ${Number(bridgeInfo.bridgeFeeAmount) / 100}%`);
    console.log(`  Is Active: ${bridgeInfo.isActive}`);
    
    // Check user balances
    console.log('\n💰 User Balances:');
    const userBalance = await pyusdContract.balanceOf(USER_ADDRESS);
    console.log(`  PYUSD Balance: ${ethers.formatUnits(userBalance, decimals)} ${symbol}`);
    
    // Check allowance
    const allowance = await pyusdContract.allowance(USER_ADDRESS, BRIDGE_CONTRACT_ADDRESS);
    console.log(`  Bridge Allowance: ${ethers.formatUnits(allowance, decimals)} ${symbol}`);
    
    // Check bridge balance
    const bridgeBalance = await pyusdContract.balanceOf(BRIDGE_CONTRACT_ADDRESS);
    console.log(`  Bridge Balance: ${ethers.formatUnits(bridgeBalance, decimals)} ${symbol}`);
    
    console.log('\n✅ Bridge test completed successfully!');
    
    if (userBalance > 0) {
      console.log('\n📋 Next steps to test bridge:');
      console.log('1. Go to the bridge UI');
      console.log('2. Connect your wallet');
      console.log('3. Approve PYUSD spending');
      console.log('4. Bridge a small amount (e.g., 1 PYUSD)');
    } else {
      console.log('\n⚠️ User has no PYUSD balance. Get some PYUSD first to test the bridge.');
    }
    
  } catch (error) {
    console.error('❌ Bridge test failed:', error.message);
  }
}

testBridge();