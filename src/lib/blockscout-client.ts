
import axios from 'axios';
import { GraphQLClient } from 'graphql-request';

export class ChimeraBlockscoutClient {
  private baseUrl: string;
  private apiKey?: string;
  private graphqlClient: GraphQLClient;

  constructor(baseUrl: string = 'https://eth.blockscout.com') {
    this.baseUrl = baseUrl;
    this.apiKey = process.env.BLOCKSCOUT_API_KEY;
    this.graphqlClient = new GraphQLClient(`${this.baseUrl}/api/v1/graphql`);
  }

  // Get transaction details
  async getTransaction(txHash: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v2/transactions/${txHash}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });
      const tx = response.data;
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
      const response = await axios.get(`${this.baseUrl}/api/v2/addresses/${address}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });
      const contract = response.data;
      return {
        address: contract.hash,
        name: contract.name,
        verified: contract.is_verified,
        abi: contract.abi,
        sourceCode: contract.source_code,
        transactions: contract.transactions_count
      };
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  // Get token details
  async getToken(address: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v2/tokens/${address}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });
      const token = response.data;
      return {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        totalSupply: token.total_supply,
        holders: token.holders_count
      };
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  }

  // Get address transactions
  async getAddressTransactions(address: string, limit: number = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v2/addresses/${address}/transactions`, {
        params: { limit },
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });
      const txs = response.data.items || [];
      return txs.map((tx: any) => ({
        hash: tx.hash,
        status: tx.status,
        method: tx.method,
        from: tx.from?.hash,
        to: tx.to?.hash,
        value: tx.value,
        timestamp: tx.timestamp
      }));
    } catch (error) {
      console.error('Error fetching address transactions:', error);
      return [];
    }
  }

  // Get ChimeraProtocol specific data using GraphQL
  async getChimeraProtocolStats() {
    const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
    if (!chimeraAddress) return null;

    const query = `
      query GetChimeraStats($address: AddressHash!) {
        address(hash: $address) {
          hash
          transactionsCount
          transactions(first: 100) {
            edges {
              node {
                hash
                status
                blockNumber
                gasUsed
                value
                createdContractAddressHash
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphqlClient.request(query, { 
        address: chimeraAddress 
      });

      const transactions = data.address?.transactions?.edges?.map((edge: any) => edge.node) || [];
      
      // Analyze transaction patterns
      const marketCreatedTxs = transactions.filter((tx: any) => 
        tx.gasUsed > 200000 // Market creation uses more gas
      );
      
      const betPlacedTxs = transactions.filter((tx: any) => 
        tx.gasUsed > 50000 && tx.gasUsed < 200000 // Betting uses moderate gas
      );

      return {
        address: chimeraAddress,
        stats: {
          totalTransactions: data.address?.transactionsCount || 0,
          marketsCreated: marketCreatedTxs.length,
          betsPlaced: betPlacedTxs.length,
          avgGasUsed: transactions.reduce((sum: number, tx: any) => sum + parseInt(tx.gasUsed || '0'), 0) / transactions.length
        },
        recentActivity: transactions.slice(0, 10),
        explorerUrl: `${this.baseUrl}/address/${chimeraAddress}`
      };
    } catch (error) {
      console.error('Error fetching ChimeraProtocol stats:', error);
      return null;
    }
  }

  // Real-time transaction monitoring
  async subscribeToChimeraTransactions(callback: (tx: any) => void) {
    const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
    if (!chimeraAddress) return;

    // WebSocket subscription for real-time updates
    const wsUrl = this.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/socket/websocket';
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🔗 Connected to Blockscout WebSocket');
        // Subscribe to address transactions
        ws.send(JSON.stringify({
          topic: `addresses:${chimeraAddress}`,
          event: 'phx_join',
          payload: {},
          ref: 1
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event === 'transaction') {
          callback(data.payload);
        }
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      return null;
    }
  }

  // Advanced analytics using Blockscout API
  async getMarketAnalytics(marketId: number) {
    const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
    
    const query = `
      query GetMarketAnalytics($address: AddressHash!) {
        address(hash: $address) {
          transactions(first: 1000) {
            edges {
              node {
                hash
                input
                value
                gasUsed
                status
                blockNumber
                block {
                  timestamp
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphqlClient.request(query, { 
        address: chimeraAddress 
      });

      const transactions = data.address?.transactions?.edges?.map((edge: any) => edge.node) || [];
      
      // Analyze market-specific transactions
      const marketTxs = transactions.filter((tx: any) => {
        // Look for market ID in transaction input data
        return tx.input?.includes(marketId.toString(16).padStart(64, '0'));
      });

      const totalVolume = marketTxs.reduce((sum: number, tx: any) => 
        sum + parseFloat(tx.value || '0'), 0
      );

      const timeSeriesData = marketTxs.map((tx: any) => ({
        timestamp: tx.block?.timestamp,
        value: parseFloat(tx.value || '0'),
        gasUsed: parseInt(tx.gasUsed || '0')
      }));

      return {
        marketId,
        totalTransactions: marketTxs.length,
        totalVolume,
        avgTransactionValue: totalVolume / marketTxs.length,
        timeSeriesData,
        explorerUrl: `${this.baseUrl}/address/${chimeraAddress}?tab=txs`
      };
    } catch (error) {
      console.error('Error fetching market analytics:', error);
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
