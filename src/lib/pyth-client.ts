import { PythHttpClient, getPythProgramKeyForCluster } from '@pythnetwork/client';
import { Connection, PublicKey } from '@solana/web3.js';

// Pyth Network configuration
const PYTH_HTTP_ENDPOINT = 'https://hermes.pyth.network';
const SOLANA_CLUSTER_NAME = 'mainnet-beta'; // or 'devnet' for testing

export class PythPriceService {
  private client: PythHttpClient;
  
  constructor() {
    this.client = new PythHttpClient(
      new Connection('https://api.mainnet-beta.solana.com'),
      getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME)
    );
  }

  // Get latest price for a given price feed ID
  async getLatestPrice(priceId: string) {
    try {
      const priceFeeds = await this.client.getAssetPricesFromIds([priceId]);
      const priceFeed = priceFeeds[0];
      
      if (!priceFeed || !priceFeed.price) {
        throw new Error(`No price data found for ${priceId}`);
      }

      return {
        price: priceFeed.price.price,
        confidence: priceFeed.price.confidence,
        expo: priceFeed.price.expo,
        publishTime: priceFeed.price.publishTime,
        formattedPrice: this.formatPrice(priceFeed.price.price, priceFeed.price.expo),
      };
    } catch (error) {
      console.error('Error fetching Pyth price:', error);
      throw error;
    }
  }

  // Get price update data for on-chain submission
  async getPriceUpdateData(priceIds: string[]) {
    try {
      const response = await fetch(`${PYTH_HTTP_ENDPOINT}/api/latest_price_feeds?ids[]=${priceIds.join('&ids[]=')}&binary=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.arrayBuffer();
      return [`0x${Buffer.from(data).toString('hex')}`];
    } catch (error) {
      console.error('Error fetching price update data:', error);
      throw error;
    }
  }

  // Format price with proper decimal places
  private formatPrice(price: number, expo: number): string {
    const adjustedPrice = price * Math.pow(10, expo);
    return adjustedPrice.toFixed(Math.abs(expo));
  }

  // Get multiple prices at once
  async getMultiplePrices(priceIds: string[]) {
    try {
      const priceFeeds = await this.client.getAssetPricesFromIds(priceIds);
      
      return priceFeeds.map((feed, index) => ({
        priceId: priceIds[index],
        price: feed?.price?.price || 0,
        confidence: feed?.price?.confidence || 0,
        expo: feed?.price?.expo || 0,
        publishTime: feed?.price?.publishTime || 0,
        formattedPrice: feed?.price ? this.formatPrice(feed.price.price, feed.price.expo) : '0',
      }));
    } catch (error) {
      console.error('Error fetching multiple Pyth prices:', error);
      throw error;
    }
  }
}

// Common Pyth price feed IDs
export const PYTH_PRICE_IDS = {
  // Crypto
  BTC_USD: '0xc5e0e0c92116c0c070a242b254270441a6201af680a33e0381561c59db3266c9',
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  USDT_USD: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  
  // Traditional Assets
  AAPL_USD: '0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688',
  TSLA_USD: '0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1',
  GOOGL_USD: '0x1b1b5d6bd4b2c2d1b4b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5',
  
  // Forex
  EUR_USD: '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
  GBP_USD: '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
  JPY_USD: '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52',
} as const;

// Price feed metadata
export const PRICE_FEED_INFO = {
  [PYTH_PRICE_IDS.BTC_USD]: { symbol: 'BTC/USD', name: 'Bitcoin' },
  [PYTH_PRICE_IDS.ETH_USD]: { symbol: 'ETH/USD', name: 'Ethereum' },
  [PYTH_PRICE_IDS.SOL_USD]: { symbol: 'SOL/USD', name: 'Solana' },
  [PYTH_PRICE_IDS.USDC_USD]: { symbol: 'USDC/USD', name: 'USD Coin' },
  [PYTH_PRICE_IDS.USDT_USD]: { symbol: 'USDT/USD', name: 'Tether' },
  [PYTH_PRICE_IDS.AAPL_USD]: { symbol: 'AAPL/USD', name: 'Apple Inc.' },
  [PYTH_PRICE_IDS.TSLA_USD]: { symbol: 'TSLA/USD', name: 'Tesla Inc.' },
  [PYTH_PRICE_IDS.EUR_USD]: { symbol: 'EUR/USD', name: 'Euro' },
  [PYTH_PRICE_IDS.GBP_USD]: { symbol: 'GBP/USD', name: 'British Pound' },
  [PYTH_PRICE_IDS.JPY_USD]: { symbol: 'JPY/USD', name: 'Japanese Yen' },
} as const;

// Create singleton instance
export const pythPriceService = new PythPriceService();