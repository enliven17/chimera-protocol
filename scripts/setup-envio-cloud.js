#!/usr/bin/env node

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';

dotenv.config();

console.log('☁️ Setting up Envio Cloud...\n');

// Check if we have envio config
if (!fs.existsSync('envio.config.yaml')) {
  console.log('❌ envio.config.yaml not found');
  process.exit(1);
}

console.log('📋 Envio Configuration:');
console.log('   Network: Hedera Testnet (296)');
console.log('   Contract: ChimeraProtocol');
console.log('   Address:', process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS);
console.log('   RPC:', process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');

console.log('\n🌐 Envio Cloud Setup Options:');
console.log('1. Manual Setup via Envio Cloud Dashboard:');
console.log('   - Go to: https://envio.dev/app');
console.log('   - Create new indexer');
console.log('   - Upload envio.config.yaml');
console.log('   - Deploy to cloud');

console.log('\n2. Alternative: Use Hosted GraphQL Service');
console.log('   - Subgraph Studio');
console.log('   - The Graph Network');
console.log('   - Goldsky');

console.log('\n3. Local Development (Linux/Mac only):');
console.log('   - Use WSL2 on Windows');
console.log('   - Or use Docker container');

console.log('\n🔧 For now, we can use direct contract calls');
console.log('   Frontend is already configured to work without Envio');
console.log('   Real-time data will come from contract events');

// Create a mock Envio endpoint for development
console.log('\n🧪 Creating mock Envio endpoint for development...');

const mockEnvioServer = `
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Mock GraphQL schema
const schema = buildSchema(\`
  type MarketCreated {
    id: String!
    marketId: String!
    title: String!
    creator: String!
    marketType: Int!
    block_timestamp: String!
    transaction_hash: String!
  }

  type BetPlaced {
    id: String!
    marketId: String!
    user: String!
    agent: String!
    option: Int!
    amount: String!
    shares: String!
    block_timestamp: String!
    transaction_hash: String!
  }

  type Query {
    MarketCreated(limit: Int, offset: Int): [MarketCreated!]!
    BetPlaced(where: BetPlacedFilter): [BetPlaced!]!
  }

  input BetPlacedFilter {
    marketId: StringFilter
    user: StringFilter
  }

  input StringFilter {
    _eq: String
  }
\`);

// Mock resolvers
const root = {
  MarketCreated: ({ limit = 10, offset = 0 }) => {
    // Return mock market data
    return [
      {
        id: '1',
        marketId: '1',
        title: 'Test Market 1',
        creator: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
        marketType: 1,
        block_timestamp: Math.floor(Date.now() / 1000).toString(),
        transaction_hash: '0x123...'
      },
      {
        id: '2',
        marketId: '2',
        title: 'Will Bitcoin reach $150,000 by December 31, 2025?',
        creator: '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123',
        marketType: 0,
        block_timestamp: Math.floor(Date.now() / 1000).toString(),
        transaction_hash: '0x3a3909f40706479be2af2db3e73be27b60ea1a56f85093f886756ea373df9545'
      }
    ];
  },
  BetPlaced: ({ where }) => {
    // Return mock bet data
    return [];
  }
};

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/v1/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

const PORT = 8080;
app.listen(PORT, () => {
  console.log(\`🚀 Mock Envio GraphQL server running on http://localhost:\${PORT}/v1/graphql\`);
  console.log(\`🔍 GraphiQL interface: http://localhost:\${PORT}/v1/graphql\`);
});
`;

fs.writeFileSync('scripts/mock-envio-server.js', mockEnvioServer);

console.log('✅ Created mock-envio-server.js');
console.log('\n🚀 To start mock Envio server:');
console.log('   npm install express express-graphql graphql');
console.log('   node scripts/mock-envio-server.js');

console.log('\n📊 This will provide:');
console.log('   ✅ GraphQL endpoint at http://localhost:8080/v1/graphql');
console.log('   ✅ Mock market data for development');
console.log('   ✅ GraphiQL interface for testing');
console.log('   ✅ CORS enabled for frontend');

console.log('\n🎯 Next steps:');
console.log('1. Install GraphQL dependencies');
console.log('2. Start mock server');
console.log('3. Test frontend with Envio data');
console.log('4. Later: Deploy real Envio indexer on cloud');