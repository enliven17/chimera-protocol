
'use client';

import { useState, useEffect } from 'react';
import { ChimeraBlockscoutClient } from '@/lib/blockscout-client';

// Initialize Blockscout client for Hedera
const blockscoutClient = new ChimeraBlockscoutClient('https://eth.blockscout.com');

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
  marketId?: number;
  realTime?: boolean;
}

export function BlockscoutExplorer({ address, showStats = true, marketId, realTime = false }: ExplorerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

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

        // Get market-specific analytics if marketId provided
        if (marketId) {
          const analytics = await blockscoutClient.getMarketAnalytics(marketId);
          setMarketAnalytics(analytics);
        }

        // Setup real-time monitoring if enabled
        if (realTime) {
          const ws = await blockscoutClient.subscribeToChimeraTransactions((newTx) => {
            setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
          });
          setWsConnection(ws);
        }
      } catch (error) {
        console.error('Error fetching explorer data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Cleanup WebSocket on unmount
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [address, showStats, marketId, realTime]);

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
                        href={`https://hashscan.io/testnet/transaction/${tx.hash}`}
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tx.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
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
