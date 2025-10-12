
import axios from 'axios';

export class ChimeraBlockscoutClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.apiKey = process.env.BLOCKSCOUT_API_KEY;
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
