import { ethers } from 'ethers';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

// Pyth contract ABI for updatePriceFeeds
const PYTH_ABI = [
  "function updatePriceFeeds(bytes[] calldata updateData) external payable",
  "function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount)",
  "function getPrice(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime)",
  "function getPriceUnsafe(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime)"
];

export class PythPriceUpdater {
  private connection: EvmPriceServiceConnection;
  private pythContract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    pythContractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    this.connection = new EvmPriceServiceConnection('https://hermes.pyth.network');
    this.provider = provider;
    this.signer = signer;
    this.pythContract = new ethers.Contract(
      pythContractAddress,
      PYTH_ABI,
      signer || provider
    );
  }

  /**
   * Step 1: Fetch price update data from Hermes
   */
  async fetchPriceUpdateData(priceIds: string[]): Promise<string[]> {
    try {
      console.log('📡 Fetching price update data from Hermes...');
      const updateData = await this.connection.getPriceFeedsUpdateData(priceIds);
      console.log('✅ Price update data fetched successfully');
      return updateData;
    } catch (error) {
      console.error('❌ Error fetching price update data:', error);
      throw error;
    }
  }

  /**
   * Step 2: Update prices on-chain using updatePriceFeeds
   */
  async updatePricesOnChain(priceIds: string[]): Promise<ethers.TransactionReceipt> {
    if (!this.signer) {
      throw new Error('Signer required for on-chain updates');
    }

    try {
      // Fetch update data
      const updateData = await this.fetchPriceUpdateData(priceIds);

      // Get update fee
      const updateFee = await this.pythContract.getUpdateFee(updateData);
      console.log('💰 Update fee:', ethers.formatEther(updateFee), 'ETH');

      // Update prices on-chain
      console.log('🔄 Updating prices on-chain...');
      const tx = await this.pythContract.updatePriceFeeds(updateData, {
        value: updateFee,
        gasLimit: 500000 // Adjust as needed
      });

      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Prices updated on-chain successfully');
      console.log('📝 Transaction hash:', receipt.hash);

      return receipt;
    } catch (error) {
      console.error('❌ Error updating prices on-chain:', error);
      throw error;
    }
  }

  /**
   * Step 3: Consume the updated price
   */
  async getPrice(priceId: string): Promise<{
    price: bigint;
    conf: bigint;
    expo: number;
    publishTime: bigint;
    formattedPrice: string;
  }> {
    try {
      console.log('📊 Getting price from on-chain contract...');
      const priceData = await this.pythContract.getPrice(priceId);
      
      const formattedPrice = Number(priceData.price) * Math.pow(10, priceData.expo);
      
      return {
        price: priceData.price,
        conf: priceData.conf,
        expo: priceData.expo,
        publishTime: priceData.publishTime,
        formattedPrice: formattedPrice.toFixed(2)
      };
    } catch (error) {
      console.error('❌ Error getting price from contract:', error);
      throw error;
    }
  }

  /**
   * Get price without requiring recent update (unsafe but faster)
   */
  async getPriceUnsafe(priceId: string): Promise<{
    price: bigint;
    conf: bigint;
    expo: number;
    publishTime: bigint;
    formattedPrice: string;
  }> {
    try {
      const priceData = await this.pythContract.getPriceUnsafe(priceId);
      
      const formattedPrice = Number(priceData.price) * Math.pow(10, priceData.expo);
      
      return {
        price: priceData.price,
        conf: priceData.conf,
        expo: priceData.expo,
        publishTime: priceData.publishTime,
        formattedPrice: formattedPrice.toFixed(2)
      };
    } catch (error) {
      console.error('❌ Error getting unsafe price:', error);
      throw error;
    }
  }

  /**
   * Complete flow: Fetch -> Update -> Consume
   */
  async updateAndGetPrice(priceId: string): Promise<{
    price: bigint;
    conf: bigint;
    expo: number;
    publishTime: bigint;
    formattedPrice: string;
    txHash: string;
  }> {
    // Step 1 & 2: Update price on-chain
    const receipt = await this.updatePricesOnChain([priceId]);
    
    // Step 3: Get the updated price
    const priceData = await this.getPrice(priceId);
    
    return {
      ...priceData,
      txHash: receipt.hash
    };
  }

  /**
   * Batch update multiple prices
   */
  async batchUpdatePrices(priceIds: string[]): Promise<ethers.TransactionReceipt> {
    return this.updatePricesOnChain(priceIds);
  }

  /**
   * Check if price needs update (older than threshold)
   */
  async isPriceStale(priceId: string, maxAgeSeconds: number = 60): Promise<boolean> {
    try {
      const priceData = await this.getPriceUnsafe(priceId);
      const currentTime = Math.floor(Date.now() / 1000);
      const priceAge = currentTime - Number(priceData.publishTime);
      
      return priceAge > maxAgeSeconds;
    } catch (error) {
      // If we can't get price, assume it's stale
      return true;
    }
  }

  /**
   * Auto-update price if stale
   */
  async ensureFreshPrice(priceId: string, maxAgeSeconds: number = 60): Promise<void> {
    const isStale = await this.isPriceStale(priceId, maxAgeSeconds);
    
    if (isStale) {
      console.log('⚠️ Price is stale, updating...');
      await this.updatePricesOnChain([priceId]);
    } else {
      console.log('✅ Price is fresh, no update needed');
    }
  }
}

// Factory function to create updater with environment config
export function createPythUpdater(signer?: ethers.Signer): PythPriceUpdater {
  const pythContractAddress = process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS;
  if (!pythContractAddress) {
    throw new Error('NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS not configured');
  }

  const rpcUrl = process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  return new PythPriceUpdater(pythContractAddress, provider, signer);
}

// Common price IDs for easy access
export const PYTH_PRICE_IDS = {
  BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  USDT_USD: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
} as const;