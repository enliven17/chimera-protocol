import { config } from "dotenv";
import fs from "fs";

config();

/**
 * Autoscout Explorer Deployment Script for ChimeraProtocol
 * Creates a custom Blockscout explorer for Hedera Testnet
 */

async function deployAutoscout() {
  console.log("🚀 Deploying ChimeraProtocol Autoscout Explorer...");

  // Hedera Testnet configuration for Autoscout
  const autoscoutConfig = {
    network: {
      name: "ChimeraProtocol Hedera Testnet",
      shortName: "chimera-hedera",
      chainId: 296,
      rpcUrl: "https://testnet.hashio.io/api",
      currency: {
        name: "HBAR",
        symbol: "HBAR",
        decimals: 18
      },
      explorerUrl: "https://hashscan.io/testnet"
    },
    
    // ChimeraProtocol specific contracts
    contracts: {
      ChimeraProtocol: {
        address: process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS,
        name: "ChimeraProtocol",
        description: "AI-powered prediction market with agent delegation",
        verified: true,
        tags: ["prediction-market", "ai", "defi"]
      },
      wPYUSD: {
        address: process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS,
        name: "Wrapped PayPal USD",
        description: "PYUSD token for Hedera ecosystem",
        verified: true,
        tags: ["stablecoin", "paypal", "token"]
      },
      PythOracle: {
        address: process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS,
        name: "Pyth Price Oracle",
        description: "Decentralized price feeds for market settlement",
        verified: true,
        tags: ["oracle", "price-feeds", "pyth"]
      }
    },

    // Custom branding for ChimeraProtocol
    branding: {
      title: "ChimeraProtocol Explorer",
      description: "Explore ChimeraProtocol prediction markets on Hedera",
      logo: "https://chimera-protocol.com/logo.png",
      favicon: "https://chimera-protocol.com/favicon.ico",
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6"
    },

    // Features to enable
    features: {
      transactions: true,
      tokens: true,
      contracts: true,
      analytics: true,
      api: true,
      websockets: true,
      graphql: true
    },

    // API endpoints for integration
    api: {
      baseUrl: "https://chimera-explorer.blockscout.com/api/v2",
      graphqlUrl: "https://chimera-explorer.blockscout.com/api/v1/graphql",
      websocketUrl: "wss://chimera-explorer.blockscout.com/socket/websocket"
    }
  };

  // Save configuration
  const configPath = "blockscout/autoscout-config.json";
  if (!fs.existsSync("blockscout")) {
    fs.mkdirSync("blockscout", { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(autoscoutConfig, null, 2));
  console.log("✅ Autoscout configuration saved:", configPath);

  // Create deployment instructions
  const instructions = `
# ChimeraProtocol Autoscout Explorer Deployment

## 🚀 Quick Deploy Steps:

1. **Create Account**: Go to https://deploy.blockscout.com/
2. **Login**: Use your credentials
3. **Request Credits**: Ask in EthGlobal Discord with email
4. **Add Instance**: Click "Add instance" button
5. **Configure Network**:
   - Network Name: ChimeraProtocol Hedera Testnet
   - Chain ID: 296
   - RPC URL: https://testnet.hashio.io/api
   - Currency: HBAR
   - Block Time: 3 seconds

## 📋 Contract Addresses to Add:

### ChimeraProtocol Main Contract
- Address: ${process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS}
- Name: ChimeraProtocol
- Description: AI-powered prediction market

### wPYUSD Token
- Address: ${process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS}
- Name: Wrapped PayPal USD
- Description: PYUSD for Hedera

### Pyth Oracle
- Address: ${process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS}
- Name: Pyth Price Oracle
- Description: Decentralized price feeds

## 🎨 Branding Options:
- Title: ChimeraProtocol Explorer
- Primary Color: #6366f1
- Secondary Color: #8b5cf6

## 📊 Features to Enable:
✅ Transactions
✅ Tokens  
✅ Smart Contracts
✅ Analytics
✅ API Access
✅ WebSocket Support
✅ GraphQL Endpoint

## 🔗 Expected URLs:
- Explorer: https://chimera-explorer.blockscout.com
- API: https://chimera-explorer.blockscout.com/api/v2
- GraphQL: https://chimera-explorer.blockscout.com/api/v1/graphql

## 🏆 Bounty Compliance:
This deployment qualifies for the "Best use of Autoscout" bounty by:
- Creating custom explorer for ChimeraProtocol
- Supporting Hedera Testnet (EVM-compatible)
- Tracking all project transactions
- Providing API access for integration
- Custom branding and contract verification
`;

  fs.writeFileSync("blockscout/AUTOSCOUT_DEPLOYMENT.md", instructions);
  console.log("✅ Deployment instructions created: blockscout/AUTOSCOUT_DEPLOYMENT.md");

  console.log("\n🎉 Autoscout configuration ready!");
  console.log("📋 Next steps:");
  console.log("1. Go to https://deploy.blockscout.com/");
  console.log("2. Create account and request credits in Discord");
  console.log("3. Use the configuration in blockscout/autoscout-config.json");
  console.log("4. Deploy and get your custom explorer URL");
}

deployAutoscout().catch(console.error);