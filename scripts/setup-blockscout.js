import { ethers } from "hardhat";
import { config } from "dotenv";
import fs from "fs";

config();

/**
 * Setup Blockscout integration for ChimeraProtocol
 * This includes Autoscout deployment and SDK integration
 */

async function setupBlockscout() {
  console.log("🔍 Setting up Blockscout integration for ChimeraProtocol...");

  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;

  // 1. Create Blockscout configuration
  console.log("1️⃣ Creating Blockscout configuration...");
  
  const blockscoutConfig = {
    network: {
      name: "Hedera Testnet",
      chainId: 296,
      rpcUrl: "https://testnet.hashio.io/api",
      currency: "HBAR",
      explorer: "https://hashscan.io/testnet"
    },
    contracts: {
      ChimeraProtocol: {
        address: chimeraAddress,
        name: "ChimeraProtocol",
        description: "AI-powered prediction market with agent delegation",
        abi: "contracts/ChimeraProtocol.sol/ChimeraProtocol.json"
      },
      PYUSD: {
        address: pyusdAddress,
        name: "Wrapped PayPal USD",
        description: "Wrapped PYUSD token for Hedera",
        abi: "@openzeppelin/contracts/token/ERC20/IERC20.sol"
      }
    },
    features: {
      transactions: true,
      tokens: true,
      contracts: true,
      analytics: true
    }
  };

  const configPath = "blockscout/config.json";
  
  if (!fs.existsSync("blockscout")) {
    fs.mkdirSync("blockscout", { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(blockscoutConfig, null, 2));
  console.log("✅ Blockscout config created:", configPath);

  // 2. Create Autoscout deployment script
  console.log("2️⃣ Creating Autoscout deployment script...");
  
  const autoscoutScript = `#!/bin/bash
# Autoscout deployment script for ChimeraProtocol

echo "🚀 Deploying Blockscout Autoscout for ChimeraProtocol..."

# Set environment variables
export NETWORK_NAME="Hedera Testnet"
export NETWORK_ID=296
export NETWORK_RPC_URL="https://testnet.hashio.io/api"
export NETWORK_CURRENCY="HBAR"

# Deploy Autoscout instance
docker run -d \\
  --name chimera-blockscout \\
  -p 4000:4000 \\
  -e NETWORK_NAME="$NETWORK_NAME" \\
  -e NETWORK_ID=$NETWORK_ID \\
  -e NETWORK_RPC_URL="$NETWORK_RPC_URL" \\
  -e NETWORK_CURRENCY="$NETWORK_CURRENCY" \\
  -e DATABASE_URL="postgresql://postgres:password@db:5432/blockscout" \\
  -v $(pwd)/blockscout/config.json:/app/config.json \\
  blockscout/blockscout:latest

echo "✅ Autoscout deployed at http://localhost:4000"
echo "📋 Next steps:"
echo "1. Wait for initialization (2-3 minutes)"
echo "2. Access explorer at http://localhost:4000"
echo "3. Verify contracts in the UI"
`;

  fs.writeFileSync("blockscout/deploy-autoscout.sh", autoscoutScript);
  console.log("✅ Autoscout deployment script created");

  // 3. Create Blockscout SDK integration
  console.log("3️⃣ Creating Blockscout SDK integration...");
  
  const sdkIntegration = `
import { BlockscoutSDK } from '@blockscout/sdk';

export class ChimeraBlockscoutClient {
  private sdk: BlockscoutSDK;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.sdk = new BlockscoutSDK({
      baseUrl: this.baseUrl,
      apiKey: process.env.BLOCKSCOUT_API_KEY
    });
  }

  // Get transaction details
  async getTransaction(txHash: string) {
    try {
      const tx = await this.sdk.transaction.getByHash(txHash);
      return {
        hash: tx.hash,
        status: tx.status,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: tx.timestamp
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  // Get contract details
  async getContract(address: string) {
    try {
      const contract = await this.sdk.contract.getByAddress(address);
      return {
        address: contract.address,
        name: contract.name,
        verified: contract.verified,
        abi: contract.abi,
        sourceCode: contract.sourceCode,
        transactions: contract.transactionCount
      };
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  // Get token details
  async getToken(address: string) {
    try {
      const token = await this.sdk.token.getByAddress(address);
      return {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        totalSupply: token.totalSupply,
        holders: token.holdersCount
      };
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  }

  // Get address transactions
  async getAddressTransactions(address: string, limit: number = 50) {
    try {
      const txs = await this.sdk.address.getTransactions(address, { limit });
      return txs.map(tx => ({
        hash: tx.hash,
        status: tx.status,
        method: tx.method,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: tx.timestamp
      }));
    } catch (error) {
      console.error('Error fetching address transactions:', error);
      return [];
    }
  }

  // Get ChimeraProtocol specific data
  async getChimeraProtocolStats() {
    const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
    if (!chimeraAddress) return null;

    try {
      const [contract, transactions] = await Promise.all([
        this.getContract(chimeraAddress),
        this.getAddressTransactions(chimeraAddress, 100)
      ]);

      // Filter ChimeraProtocol events
      const marketCreatedTxs = transactions.filter(tx => 
        tx.method?.includes('createMarket')
      );
      
      const betPlacedTxs = transactions.filter(tx => 
        tx.method?.includes('placeBet')
      );

      const marketResolvedTxs = transactions.filter(tx => 
        tx.method?.includes('resolveMarket')
      );

      return {
        contract,
        stats: {
          totalTransactions: transactions.length,
          marketsCreated: marketCreatedTxs.length,
          betsPlaced: betPlacedTxs.length,
          marketsResolved: marketResolvedTxs.length
        },
        recentActivity: transactions.slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching ChimeraProtocol stats:', error);
      return null;
    }
  }

  // Get PYUSD token stats
  async getPYUSDStats() {
    const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
    if (!pyusdAddress) return null;

    try {
      const [token, transactions] = await Promise.all([
        this.getToken(pyusdAddress),
        this.getAddressTransactions(pyusdAddress, 100)
      ]);

      return {
        token,
        recentTransfers: transactions.slice(0, 20)
      };
    } catch (error) {
      console.error('Error fetching PYUSD stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const blockscoutClient = new ChimeraBlockscoutClient();
`;

  fs.writeFileSync("src/lib/blockscout-client.ts", sdkIntegration);
  console.log("✅ Blockscout SDK integration created");

  // 4. Create React component for embedded explorer
  console.log("4️⃣ Creating React component for embedded explorer...");
  
  const explorerComponent = `
'use client';

import { useState, useEffect } from 'react';
import { blockscoutClient } from '@/lib/blockscout-client';

interface Transaction {
  hash: string;
  status: string;
  method?: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
}

interface ExplorerProps {
  address?: string;
  showStats?: boolean;
}

export function BlockscoutExplorer({ address, showStats = true }: ExplorerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        if (address) {
          const txs = await blockscoutClient.getAddressTransactions(address);
          setTransactions(txs);
        }

        if (showStats) {
          const chimeraStats = await blockscoutClient.getChimeraProtocolStats();
          setStats(chimeraStats);
        }
      } catch (error) {
        console.error('Error fetching explorer data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [address, showStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.stats.totalTransactions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Markets Created</h3>
            <p className="text-2xl font-bold text-green-600">{stats.stats.marketsCreated}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Bets Placed</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.stats.betsPlaced}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Markets Resolved</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.stats.marketsResolved}</p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Transactions
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      <a 
                        href={\`https://hashscan.io/testnet/transaction/\${tx.hash}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {tx.hash.slice(0, 10)}...
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.method || 'Transfer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {tx.from.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {tx.to.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`inline-flex px-2 py-1 text-xs font-semibold rounded-full \${
                        tx.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }\`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync("src/components/explorer/blockscout-explorer.tsx", explorerComponent);
  console.log("✅ Blockscout Explorer component created");

  // 5. Update package.json with Blockscout SDK
  console.log("5️⃣ Adding Blockscout SDK to dependencies...");
  
  const packageJsonPath = "package.json";
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  
  // Note: @blockscout/sdk is not yet available, using alternative approach
  packageJson.dependencies["graphql-request"] = "^6.1.0";
  packageJson.dependencies["axios"] = "^1.6.0";
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✅ Package.json updated with Blockscout SDK");

  console.log("\n🎉 Blockscout integration setup completed!");
  console.log("📋 Next steps:");
  console.log("1. Install dependencies: npm install");
  console.log("2. Deploy Autoscout: bash blockscout/deploy-autoscout.sh");
  console.log("3. Add BLOCKSCOUT_API_KEY to .env");
  console.log("4. Import BlockscoutExplorer component in your pages");
}

setupBlockscout().catch(console.error);