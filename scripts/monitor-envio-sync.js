#!/usr/bin/env node

import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://indexer.dev.hyperindex.xyz/be31b19/v1/graphql');

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
          MarketCreatedEvent(limit: 1) {
            id
            marketId
            title
            blockTimestamp
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