/**
 * ChimeraProtocol Lit Protocol Vincent Skill
 * Securely executes betting actions on behalf of users with proper delegation checks
 */

const { LitNodeClient } = require("@lit-protocol/lit-node-client");
const { LitNetwork } = require("@lit-protocol/constants");
const { ethers } = require("ethers");

class ChimeraVincentSkill {
  constructor(config) {
    this.config = config;
    this.litNodeClient = null;
    this.provider = null;
    this.chimeraContract = null;
    
    this.init();
  }

  async init() {
    console.log("🔒 Initializing Lit Protocol Vincent Skill...");
    
    // Initialize Lit Protocol client
    this.litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne, // Testnet
      debug: true
    });
    
    await this.litNodeClient.connect();
    console.log("✅ Connected to Lit Protocol network");
    
    // Initialize Hedera provider
    this.provider = new ethers.JsonRpcProvider(this.config.hederaRpcUrl);
    
    // Initialize ChimeraProtocol contract
    this.chimeraContract = new ethers.Contract(
      this.config.chimeraContractAddress,
      this.config.chimeraAbi,
      this.provider
    );
    
    console.log("✅ ChimeraProtocol Vincent Skill initialized");
  }

  /**
   * Main skill execution function
   * Called by ASI agent with betting instructions
   */
  async executeSkill(params) {
    console.log("🎯 Executing ChimeraProtocol skill with params:", params);
    
    const { action, marketId, option, amount, userAddress, analysis } = params;
    
    try {
      switch (action) {
        case "place_bet":
          return await this.placeBet(marketId, option, amount, userAddress, analysis);
        
        case "check_delegation":
          return await this.checkDelegation(userAddress);
        
        case "get_market_info":
          return await this.getMarketInfo(marketId);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error("❌ Skill execution failed:", error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Place a bet on behalf of a user with proper delegation checks
   */
  async placeBet(marketId, option, amount, userAddress, analysis) {
    console.log(`🎲 Placing bet for user ${userAddress}:`);
    console.log(`   Market: ${marketId}, Option: ${option}, Amount: ${amount}`);
    
    // 1. Check if agent is delegated by user
    const isDelegated = await this.chimeraContract.isAgentDelegated(
      userAddress,
      this.config.agentAddress
    );
    
    if (!isDelegated) {
      throw new Error(`Agent not delegated by user ${userAddress}`);
    }
    
    // 2. Check delegation limits
    const maxBetAmount = await this.chimeraContract.getAgentMaxBet(
      this.config.agentAddress
    );
    
    if (amount > maxBetAmount) {
      throw new Error(`Bet amount ${amount} exceeds delegation limit ${maxBetAmount}`);
    }
    
    // 3. Get market info and validate
    const market = await this.chimeraContract.getMarket(marketId);
    
    if (market.status !== 0) { // 0 = Active
      throw new Error(`Market ${marketId} is not active`);
    }
    
    if (Date.now() / 1000 >= market.endTime) {
      throw new Error(`Market ${marketId} has ended`);
    }
    
    if (amount < market.minBet || amount > market.maxBet) {
      throw new Error(`Bet amount ${amount} outside market limits [${market.minBet}, ${market.maxBet}]`);
    }
    
    // 4. Prepare and execute transaction using Lit Actions
    const litActionCode = `
      const go = async () => {
        // Check PYUSD allowance
        const pyusdContract = new ethers.Contract(
          "${this.config.pyusdContractAddress}",
          ["function allowance(address,address) view returns (uint256)"],
          signer
        );
        
        const allowance = await pyusdContract.allowance(
          "${userAddress}",
          "${this.config.chimeraContractAddress}"
        );
        
        if (allowance < ${amount}) {
          throw new Error("Insufficient PYUSD allowance");
        }
        
        // Execute bet placement
        const chimeraContract = new ethers.Contract(
          "${this.config.chimeraContractAddress}",
          ["function placeBetForUser(uint256,uint8,uint256,address) external"],
          signer
        );
        
        const tx = await chimeraContract.placeBetForUser(
          ${marketId},
          ${option},
          ${amount},
          "${userAddress}"
        );
        
        return tx.hash;
      };
      
      go();
    `;
    
    // Execute Lit Action
    const results = await this.litNodeClient.executeJs({
      code: litActionCode,
      authSig: this.config.authSig,
      jsParams: {
        marketId,
        option,
        amount,
        userAddress
      }
    });
    
    const txHash = results.response;
    
    console.log("✅ Bet placed successfully, tx hash:", txHash);
    
    // Log the action for audit
    await this.logAction({
      action: "place_bet",
      marketId,
      option,
      amount,
      userAddress,
      txHash,
      analysis,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      txHash,
      marketId,
      option,
      amount,
      userAddress,
      analysis,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if agent is properly delegated by user
   */
  async checkDelegation(userAddress) {
    console.log(`🔍 Checking delegation for user ${userAddress}`);
    
    const isDelegated = await this.chimeraContract.isAgentDelegated(
      userAddress,
      this.config.agentAddress
    );
    
    const maxBetAmount = isDelegated ? 
      await this.chimeraContract.getAgentMaxBet(this.config.agentAddress) : 0;
    
    return {
      success: true,
      isDelegated,
      maxBetAmount: maxBetAmount.toString(),
      agentAddress: this.config.agentAddress,
      userAddress,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get market information
   */
  async getMarketInfo(marketId) {
    console.log(`📊 Getting market info for market ${marketId}`);
    
    const market = await this.chimeraContract.getMarket(marketId);
    
    return {
      success: true,
      market: {
        id: market.id.toString(),
        title: market.title,
        description: market.description,
        optionA: market.optionA,
        optionB: market.optionB,
        status: market.status,
        resolved: market.resolved,
        outcome: market.outcome,
        totalPool: market.totalPool.toString(),
        totalOptionAShares: market.totalOptionAShares.toString(),
        totalOptionBShares: market.totalOptionBShares.toString(),
        endTime: market.endTime.toString(),
        minBet: market.minBet.toString(),
        maxBet: market.maxBet.toString()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log action for audit trail
   */
  async logAction(actionData) {
    // In production, this would log to a secure audit system
    console.log("📝 Action logged:", JSON.stringify(actionData, null, 2));
    
    // Could also emit to Envio for indexing
    // or store in decentralized storage like IPFS
  }

  /**
   * Get skill status and configuration
   */
  getStatus() {
    return {
      skillName: "ChimeraProtocol Vincent Skill",
      version: "1.0.0",
      network: "hedera-testnet",
      chimeraContract: this.config.chimeraContractAddress,
      pyusdContract: this.config.pyusdContractAddress,
      agentAddress: this.config.agentAddress,
      connected: !!this.litNodeClient,
      timestamp: new Date().toISOString()
    };
  }
}

// Skill configuration
const config = {
  hederaRpcUrl: "https://testnet.hashio.io/api",
  chimeraContractAddress: process.env.CHIMERA_CONTRACT_ADDRESS,
  pyusdContractAddress: process.env.PYUSD_CONTRACT_ADDRESS,
  agentAddress: process.env.AGENT_ADDRESS,
  chimeraAbi: [
    "function isAgentDelegated(address user, address agent) view returns (bool)",
    "function getAgentMaxBet(address agent) view returns (uint256)",
    "function getMarket(uint256 marketId) view returns (tuple)",
    "function placeBetForUser(uint256 marketId, uint8 option, uint256 amount, address user) external"
  ],
  authSig: null // Would be set during initialization
};

// Export for use in Vincent App
module.exports = { ChimeraVincentSkill, config };

// If running directly, start the skill server
if (require.main === module) {
  const express = require("express");
  const app = express();
  const port = process.env.PORT || 3001;
  
  app.use(express.json());
  
  const skill = new ChimeraVincentSkill(config);
  
  // Skill execution endpoint
  app.post("/execute", async (req, res) => {
    try {
      const result = await skill.executeSkill(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Status endpoint
  app.get("/status", (req, res) => {
    res.json(skill.getStatus());
  });
  
  app.listen(port, () => {
    console.log(`🚀 ChimeraProtocol Vincent Skill server running on port ${port}`);
  });
}