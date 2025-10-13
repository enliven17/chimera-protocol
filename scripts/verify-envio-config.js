#!/usr/bin/env node

import { ethers } from 'ethers';
import fs from 'fs';
import yaml from 'js-yaml';

// Read envio config
const envioConfig = yaml.load(fs.readFileSync('envio.config.yaml', 'utf8'));

// Contract ABI
const abi = [
  "event MarketCreated(uint256 indexed marketId, string title, address indexed creator, uint8 marketType)",
  "event BetPlaced(uint256 indexed marketId, address indexed user, address indexed agent, uint8 option, uint256 amount, uint256 shares)",
  "event MarketResolved(uint256 indexed marketId, uint8 outcome, address indexed resolver, int64 finalPrice)",
  "event AgentDelegationUpdated(address indexed user, address indexed agent, bool approved, uint256 maxBetAmount)",
  "event PythPriceUpdated(bytes32 indexed priceId, int64 price, uint64 timestamp)"
];

console.log('🔍 Verifying Envio configuration...\n');

// Create interface to get canonical event signatures
const iface = new ethers.Interface(abi);

console.log('📋 Contract Event Signatures:');
for (const fragment of iface.fragments) {
  if (fragment.type === 'event') {
    console.log(`   ${fragment.format('full')}`);
  }
}

console.log('\n📋 Envio Config Event Signatures:');
const contract = envioConfig.contracts[0];
for (const event of contract.events) {
  console.log(`   ${event.event}`);
}

console.log('\n🔍 Verification:');
const configEvents = contract.events.map(e => e.event);
const contractEvents = iface.fragments
  .filter(f => f.type === 'event')
  .map(f => f.format('full'));

let allMatch = true;
for (const configEvent of configEvents) {
  const matches = contractEvents.includes(configEvent);
  console.log(`   ${matches ? '✅' : '❌'} ${configEvent}`);
  if (!matches) allMatch = false;
}

if (allMatch) {
  console.log('\n✅ All event signatures match!');
} else {
  console.log('\n❌ Some event signatures do not match!');
  console.log('\n🔧 Suggested fixes:');
  for (const contractEvent of contractEvents) {
    if (!configEvents.includes(contractEvent)) {
      console.log(`   Add: ${contractEvent}`);
    }
  }
}

console.log('\n📊 Configuration Summary:');
console.log(`   Network ID: ${envioConfig.networks[0].id}`);
console.log(`   Start Block: ${envioConfig.networks[0].start_block}`);
console.log(`   Contract Address: ${envioConfig.networks[0].contracts[0].address[0]}`);
console.log(`   RPC URL: ${envioConfig.networks[0].rpc_config.url}`);