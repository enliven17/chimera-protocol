import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Envio setup script for Windows compatibility
async function setupEnvio() {
  console.log("🔧 Setting up Envio HyperIndex for ChimeraProtocol...");

  // Create generated directory structure
  const generatedDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Create types file
  const typesContent = `
// Generated types for ChimeraProtocol Envio indexer
export interface Market {
  id: string;
  marketId: bigint;
  title: string;
  creator: string;
  marketType: number;
  status: number;
  resolved: boolean;
  outcome?: number;
  finalPrice?: bigint;
  totalPool: bigint;
  totalOptionAShares: bigint;
  totalOptionBShares: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  resolvedAt?: bigint;
}

export interface UserPosition {
  id: string;
  marketId: bigint;
  user: string;
  optionAShares: bigint;
  optionBShares: bigint;
  totalInvested: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface AgentDelegation {
  id: string;
  user: string;
  agent: string;
  approved: boolean;
  maxBetAmount: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface PriceUpdate {
  id: string;
  priceId: string;
  price: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
}

// Event interfaces
export interface MarketCreatedEvent {
  id: string;
  marketId: bigint;
  title: string;
  creator: string;
  marketType: number;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface BetPlacedEvent {
  id: string;
  marketId: bigint;
  user: string;
  agent: string;
  option: number;
  amount: bigint;
  shares: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface MarketResolvedEvent {
  id: string;
  marketId: bigint;
  outcome: number;
  resolver: string;
  finalPrice: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface AgentDelegationUpdatedEvent {
  id: string;
  user: string;
  agent: string;
  approved: boolean;
  maxBetAmount: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface PythPriceUpdatedEvent {
  id: string;
  priceId: string;
  price: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

// Mock ChimeraProtocol object for compatibility
export const ChimeraProtocol = {
  MarketCreated: {
    handler: (fn: any) => fn
  },
  BetPlaced: {
    handler: (fn: any) => fn
  },
  MarketResolved: {
    handler: (fn: any) => fn
  },
  AgentDelegationUpdated: {
    handler: (fn: any) => fn
  },
  PythPriceUpdated: {
    handler: (fn: any) => fn
  }
};
`;

  fs.writeFileSync(path.join(generatedDir, 'index.ts'), typesContent);
  console.log("✅ Generated types created");

  // Create package.json for generated
  const packageJson = {
    "name": "chimera-protocol-generated",
    "version": "1.0.0",
    "main": "index.ts",
    "types": "index.ts"
  };

  fs.writeFileSync(path.join(generatedDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log("✅ Generated package.json created");

  // Create Envio API client
  const envioClientContent = `
import { GraphQLClient } from 'graphql-request';

export class EnvioClient {
  private client: GraphQLClient;

  constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  async getActiveMarkets() {
    const query = \`
      query GetActiveMarkets {
        markets(where: {status: 0, resolved: false}) {
          id
          marketId
          title
          totalPool
          totalOptionAShares
          totalOptionBShares
          createdAt
          updatedAt
          marketType
          status
        }
      }
    \`;

    try {
      const data = await this.client.request(query);
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  async getMarketHistory(marketId: string) {
    const query = \`
      query GetMarketHistory($marketId: String!) {
        betPlacedEvents(where: {marketId: $marketId}) {
          id
          user
          agent
          option
          amount
          shares
          blockTimestamp
        }
      }
    \`;

    try {
      const data = await this.client.request(query, { marketId });
      return data.betPlacedEvents || [];
    } catch (error) {
      console.error('Error fetching market history:', error);
      return [];
    }
  }

  async getUserPositions(userAddress: string) {
    const query = \`
      query GetUserPositions($user: String!) {
        userPositions(where: {user: $user}) {
          id
          marketId
          optionAShares
          optionBShares
          totalInvested
        }
      }
    \`;

    try {
      const data = await this.client.request(query, { user: userAddress });
      return data.userPositions || [];
    } catch (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }
  }

  async getAgentDelegations(userAddress: string) {
    const query = \`
      query GetAgentDelegations($user: String!) {
        agentDelegations(where: {user: $user, approved: true}) {
          id
          agent
          maxBetAmount
          createdAt
        }
      }
    \`;

    try {
      const data = await this.client.request(query, { user: userAddress });
      return data.agentDelegations || [];
    } catch (error) {
      console.error('Error fetching agent delegations:', error);
      return [];
    }
  }
}
`;

  fs.writeFileSync(path.join(__dirname, '..', 'src', 'lib', 'envio-client.ts'), envioClientContent);
  console.log("✅ Envio client created");

  console.log("\n🎉 Envio setup completed!");
  console.log("📋 Manual steps:");
  console.log("1. Deploy Envio indexer on Linux/Mac or use Envio Cloud");
  console.log("2. Update ENVIO_INDEXER_URL in .env");
  console.log("3. Test with npm run test:envio");
}

setupEnvio().catch(console.error);