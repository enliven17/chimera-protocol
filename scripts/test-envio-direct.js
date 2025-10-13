#!/usr/bin/env node

import { GraphQLClient } from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const client = new GraphQLClient('https://indexer.dev.hyperindex.xyz/7aec3a0/v1/graphql');

async function testEnvioQueries() {
  console.log('🔍 Testing Envio GraphQL queries...\n');

  try {
    // Test 1: Check if endpoint is accessible
    console.log('1. Testing endpoint accessibility...');
    const introspectionQuery = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;
    
    const introspectionResult = await client.request(introspectionQuery);
    console.log('✅ Endpoint accessible');
    console.log(`   Found ${introspectionResult.__schema.types.length} types`);

    // Test 2: Check available entities
    console.log('\n2. Checking available entities...');
    const entityTypes = introspectionResult.__schema.types
      .filter(type => type.name.includes('Event') || type.name === 'Market')
      .map(type => type.name);
    console.log('   Available entities:', entityTypes);

    // Test 3: Try to query MarketCreatedEvent
    console.log('\n3. Querying MarketCreatedEvent...');
    const marketQuery = `
      query {
        MarketCreatedEvent {
          id
          marketId
          title
          creator
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;
    
    const marketResult = await client.request(marketQuery);
    console.log(`   Found ${marketResult.MarketCreatedEvent?.length || 0} MarketCreated events`);
    
    if (marketResult.MarketCreatedEvent?.length > 0) {
      console.log('   Sample event:', JSON.stringify(marketResult.MarketCreatedEvent[0], null, 2));
    }

    // Test 4: Try to query Market entities
    console.log('\n4. Querying Market entities...');
    const marketEntityQuery = `
      query {
        Market {
          id
          marketId
          title
          creator
          status
          resolved
          createdAt
        }
      }
    `;
    
    const marketEntityResult = await client.request(marketEntityQuery);
    console.log(`   Found ${marketEntityResult.Market?.length || 0} Market entities`);
    
    if (marketEntityResult.Market?.length > 0) {
      console.log('   Sample market:', JSON.stringify(marketEntityResult.Market[0], null, 2));
    }

    // Test 5: Check chain metadata
    console.log('\n5. Checking chain metadata...');
    const metaQuery = `
      query {
        chain_metadata {
          start_block
          end_block
        }
      }
    `;
    
    try {
      const metaResult = await client.request(metaQuery);
      console.log('   Chain metadata:', metaResult.chain_metadata);
    } catch (error) {
      console.log('   Chain metadata not available:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

testEnvioQueries();