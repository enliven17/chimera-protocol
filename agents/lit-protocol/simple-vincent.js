/**
 * Simplified Vincent Skill for ChimeraProtocol
 * Basic HTTP server without complex Lit Protocol initialization
 */

const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuration
const config = {
  port: 3001,
  hederaRpcUrl: process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api",
  chimeraContractAddress: process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS,
  pyusdContractAddress: process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS,
  agentAddress: process.env.AGENT_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY, // Vincent'in private key'i
  realTransactions: process.env.VINCENT_REAL_TRANSACTIONS === 'true' // Real tx flag
};

// ChimeraProtocol ABI
const CHIMERA_ABI = [
  "function isAgentDelegated(address user, address agent) view returns (bool)",
  "function getAgentMaxBet(address agent) view returns (uint256)",
  "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove))",
  "function placeBetForUser(uint256 marketId, uint8 option, uint256 amount, address user) external"
];

// PYUSD ABI
const PYUSD_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
];

class SimpleVincentSkill {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.signedContract = null;
    this.pyusdContract = null;
    this.init();
  }

  async init() {
    console.log("🔒 Initializing Simple Vincent Skill...");
    
    try {
      // Initialize provider with explicit network config
      this.provider = new ethers.JsonRpcProvider(config.hederaRpcUrl, {
        chainId: 296,
        name: "hedera-testnet"
      });

      // Test connection
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to network: ${network.name} (${network.chainId})`);

      // Initialize contracts
      if (config.chimeraContractAddress) {
        this.contract = new ethers.Contract(
          config.chimeraContractAddress,
          CHIMERA_ABI,
          this.provider
        );
        console.log(`✅ Contract initialized: ${config.chimeraContractAddress}`);
      } else {
        console.warn("⚠️ No contract address configured");
      }

      // Initialize PYUSD contract
      if (config.pyusdContractAddress) {
        this.pyusdContract = new ethers.Contract(
          config.pyusdContractAddress,
          PYUSD_ABI,
          this.provider
        );
      }

      // Initialize signer for real transactions
      if (config.agentPrivateKey && config.realTransactions) {
        this.signer = new ethers.Wallet(config.agentPrivateKey, this.provider);
        
        if (config.chimeraContractAddress) {
          this.signedContract = new ethers.Contract(
            config.chimeraContractAddress,
            CHIMERA_ABI,
            this.signer
          );
        }
        
        console.log(`✅ Real transaction mode enabled`);
        console.log(`🔑 Agent address: ${this.signer.address}`);
      } else {
        console.log(`🧪 Simulation mode - no real transactions`);
      }

    } catch (error) {
      console.error("❌ Initialization failed:", error.message);
    }
  }

  async executeAction(params) {
    console.log("🎯 Executing action:", params);
    
    const { action, marketId, option, amount, userAddress } = params;
    
    try {
      switch (action) {
        case "place_bet":
          return config.realTransactions 
            ? await this.executeBet(marketId, option, amount, userAddress)
            : await this.simulateBet(marketId, option, amount, userAddress);
        
        case "check_delegation":
          return await this.checkDelegation(userAddress);
        
        case "get_market_info":
          return await this.getMarketInfo(marketId);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error("❌ Action execution failed:", error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeBet(marketId, option, amount, userAddress) {
    console.log(`🎲 Executing REAL bet: Market ${marketId}, Option ${option}, Amount ${amount}`);
    
    if (!this.signedContract || !this.signer) {
      throw new Error("Real transaction mode not initialized");
    }

    // Validation checks
    await this.validateBet(marketId, option, amount, userAddress);

    try {
      // Check PYUSD allowance
      const allowance = await this.pyusdContract.allowance(
        userAddress,
        config.chimeraContractAddress
      );

      const amountWei = ethers.parseUnits(amount.toString(), 6); // PYUSD has 6 decimals

      if (allowance < amountWei) {
        throw new Error(`Insufficient PYUSD allowance. Required: ${amount}, Available: ${ethers.formatUnits(allowance, 6)}`);
      }

      // Execute the bet transaction
      console.log(`📝 Executing placeBetForUser transaction...`);
      
      const tx = await this.signedContract.placeBetForUser(
        marketId,
        option,
        amountWei,
        userAddress,
        {
          gasLimit: 500000, // Set gas limit
        }
      );

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        action: "place_bet",
        marketId,
        option,
        amount,
        userAddress,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString(),
        note: "Real transaction executed successfully"
      };

    } catch (error) {
      console.error(`❌ Transaction failed:`, error);
      throw new Error(`Transaction execution failed: ${error.message}`);
    }
  }

  async validateBet(marketId, option, amount, userAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    // Check delegation
    const isDelegated = await this.contract.isAgentDelegated(
      userAddress,
      config.agentAddress
    );

    if (!isDelegated) {
      throw new Error(`Agent not delegated by user ${userAddress}`);
    }

    // Check delegation limits
    const maxBetAmount = await this.contract.getAgentMaxBet(config.agentAddress);
    const amountWei = ethers.parseUnits(amount.toString(), 6);

    if (amountWei > maxBetAmount) {
      throw new Error(`Bet amount ${amount} exceeds delegation limit ${ethers.formatUnits(maxBetAmount, 6)}`);
    }

    // Get market info
    const market = await this.contract.getMarket(marketId);
    
    if (market.status !== 0) {
      throw new Error(`Market ${marketId} is not active (status: ${market.status})`);
    }

    if (Date.now() / 1000 >= market.endTime) {
      throw new Error(`Market ${marketId} has ended`);
    }

    if (amountWei < market.minBet || amountWei > market.maxBet) {
      throw new Error(`Bet amount ${amount} outside market limits [${ethers.formatUnits(market.minBet, 6)}, ${ethers.formatUnits(market.maxBet, 6)}]`);
    }

    console.log("✅ All validations passed");
  }

  async simulateBet(marketId, option, amount, userAddress) {
    console.log(`🎲 Simulating bet: Market ${marketId}, Option ${option}, Amount ${amount}`);
    
    // Run same validations as real bet
    await this.validateBet(marketId, option, amount, userAddress);

    console.log("✅ Bet simulation successful");
    
    return {
      success: true,
      action: "place_bet",
      marketId,
      option,
      amount,
      userAddress,
      txHash: "0x" + Math.random().toString(16).substr(2, 64), // Fake hash
      timestamp: new Date().toISOString(),
      note: "Simulated transaction - no real bet placed"
    };
  }

  async checkDelegation(userAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const isDelegated = await this.contract.isAgentDelegated(
      userAddress,
      config.agentAddress
    );

    const maxBet = isDelegated ? await this.contract.getAgentMaxBet(config.agentAddress) : 0;

    return {
      success: true,
      isDelegated,
      maxBetAmount: maxBet.toString(),
      agentAddress: config.agentAddress,
      timestamp: new Date().toISOString()
    };
  }

  async getMarketInfo(marketId) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const market = await this.contract.getMarket(marketId);
    
    return {
      success: true,
      market: {
        id: market.id.toString(),
        title: market.title,
        status: market.status,
        endTime: market.endTime.toString(),
        totalPool: ethers.formatUnits(market.totalPool, 6)
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize skill
const vincentSkill = new SimpleVincentSkill();

// API Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ChimeraProtocol Vincent Skill',
    timestamp: new Date().toISOString(),
    mode: config.realTransactions ? 'REAL_TRANSACTIONS' : 'SIMULATION',
    config: {
      contractAddress: config.chimeraContractAddress,
      agentAddress: config.agentAddress,
      rpcUrl: config.hederaRpcUrl,
      hasPrivateKey: !!config.agentPrivateKey,
      signerAddress: vincentSkill.signer?.address || 'Not configured'
    }
  });
});

app.post('/execute_action', async (req, res) => {
  try {
    const result = await vincentSkill.executeAction(req.body);
    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
app.post('/test', (req, res) => {
  console.log('🧪 Test endpoint called:', req.body);
  res.json({
    success: true,
    message: 'Vincent Skill is working!',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Simple Vincent Skill server running on port ${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/health`);
  console.log(`🎯 Execute action: POST http://localhost:${config.port}/execute_action`);
  console.log(`🧪 Test endpoint: POST http://localhost:${config.port}/test`);
});

module.exports = { SimpleVincentSkill };