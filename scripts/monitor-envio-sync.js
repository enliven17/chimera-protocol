#!/usr/bin/env node

import { GraphQLClient } from 'graphql-request';

// Envio Cloud GraphQL endpoint
const ENVIO_ENDPOINT = process.env.ENVIO_GRAPHQL_ENDPOINT || 'https://indexer.dev.hyperindex.xyz/7aec3a0/v1/graphql';

const client = new GraphQLClient(ENVIO_ENDPOINT);

async function monitorEnvioSync() {
  console.log('🔄 Monitoring Envio sync status...\n');

  const checkSync = async () => {
    try {
      // Check chain metadata
      const metaQuery = `
        query {
          chain_metadata {
            start_block
            end_block
          }
        }
      `;
      
      const metaResult = await client.request(metaQuery);
      const metadata = metaResult.chain_metadata[0];
      
      console.log(`📊 Sync Status: Start Block: ${metadata.start_block}, End Block: ${metadata.end_block || 'syncing...'}`);

      // Check for market data
      const marketQuery = `
        query {
          MarketCreatedEvent(limit: 5, order_by: {blockTimestamp: desc}) {
            id
            marketId
            title
            creator
            blockTimestamp
            transactionHash
          }
        }
      `;
      
      const marketResult = await client.request(marketQuery);
      const marketCount = marketResult.MarketCreatedEvent?.length || 0;
      
      console.log(`🎯 Markets indexed: ${marketCount}`);

      if (marketCount > 0) {
        console.log('✅ Envio has indexed market data!');
        console.log('Sample market:', JSON.stringify(marketResult.MarketCreatedEvent[0], null, 2));
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking sync:', error.message);
      return false;
    }
  };

  // Check every 10 seconds
  const interval = setInterval(async () => {
    const hasData = await checkSync();
    if (hasData) {
      console.log('\n🎉 Envio sync complete! Frontend will now show indexed data.');
      clearInterval(interval);
    }
  }, 10000);

  // Initial check
  await checkSync();
}

monitorEnvioSync();