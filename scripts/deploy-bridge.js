#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const BRIDGE_FEE = 10; // 0.1% in basis points
const FEE_RECIPIENT = process.env.FEE_RECIPIENT_ADDRESS || "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123";

async function deployBridge() {
  try {
    console.log('🚀 Deploying PYUSD Bridge to Sepolia...');
    
    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`👤 Deployer: ${signer.address}`);
    console.log(`💰 PYUSD Token: ${SEPOLIA_PYUSD_ADDRESS}`);
    console.log(`💸 Bridge Fee: ${BRIDGE_FEE / 100}%`);
    console.log(`🏦 Fee Recipient: ${FEE_RECIPIENT}`);
    
    // Check deployer balance
    const balance = await provider.getBalance(signer.address);
    console.log(`💰 Deployer ETH balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.01")) {
      throw new Error("Insufficient ETH balance for deployment");
    }
    
    // Read contract artifacts
    const artifactsPath = path.join(process.cwd(), 'artifacts', 'contracts', 'PYUSDBridge.sol', 'PYUSDBridge.json');
    
    if (!fs.existsSync(artifactsPath)) {
      console.log('📦 Contract not compiled. Compiling...');
      const { execSync } = await import('child_process');
      execSync('npx hardhat compile', { stdio: 'inherit' });
    }
    
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    
    // Create contract factory
    const BridgeFactory = new ethers.ContractFactory(
      artifacts.abi,
      artifacts.bytecode,
      signer
    );
    
    // Deploy contract
    console.log('📤 Deploying contract...');
    const bridge = await BridgeFactory.deploy(
      SEPOLIA_PYUSD_ADDRESS,
      BRIDGE_FEE,
      FEE_RECIPIENT,
      {
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits('1', 'gwei')
      }
    );
    
    console.log(`⏳ Waiting for deployment... TX: ${bridge.deploymentTransaction().hash}`);
    
    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();
    
    console.log(`✅ Bridge deployed at: ${bridgeAddress}`);
    
    // Verify deployment
    console.log('🔍 Verifying deployment...');
    const bridgeInfo = await bridge.getBridgeInfo();
    
    console.log('📊 Bridge Info:');
    console.log(`  Token Address: ${bridgeInfo.tokenAddress}`);
    console.log(`  Total Locked: ${ethers.formatUnits(bridgeInfo.totalLockedAmount, 6)} PYUSD`);
    console.log(`  Bridge Fee: ${Number(bridgeInfo.bridgeFeeAmount) / 100}%`);
    console.log(`  Is Active: ${bridgeInfo.isActive}`);
    
    // Save deployment info
    const deploymentInfo = {
      network: 'sepolia',
      bridgeAddress,
      pyusdAddress: SEPOLIA_PYUSD_ADDRESS,
      bridgeFee: BRIDGE_FEE,
      feeRecipient: FEE_RECIPIENT,
      deploymentTx: bridge.deploymentTransaction().hash,
      deployedAt: new Date().toISOString(),
      deployer: signer.address
    };
    
    const deploymentPath = path.join(process.cwd(), 'deployments', 'sepolia-bridge.json');
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);
    
    // Update environment variables
    console.log('\n📝 Add these to your .env file:');
    console.log(`NEXT_PUBLIC_ETH_BRIDGE_ADDRESS=${bridgeAddress}`);
    console.log(`BRIDGE_CONTRACT_ADDRESS=${bridgeAddress}`);
    
    console.log('\n🎉 Bridge deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the bridge address');
    console.log('2. Update the bridge component to use the new contract');
    console.log('3. Test the bridge with small amounts first');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployBridge();