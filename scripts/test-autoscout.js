const { blockscoutClient } = require('../src/lib/blockscout-client.ts');

async function testAutoscout() {
  console.log('🔍 Testing Autoscout Explorer...');
  
  try {
    // Test ChimeraProtocol stats
    const stats = await blockscoutClient.getChimeraProtocolStats();
    console.log('📊 ChimeraProtocol Stats:', stats);
    
    // Test active markets
    const markets = await blockscoutClient.getActiveMarkets();
    console.log('🎯 Active Markets:', markets.length);
    
    // Test PYUSD stats
    const pyusdStats = await blockscoutClient.getPYUSDStats();
    console.log('💰 PYUSD Stats:', pyusdStats);
    
    console.log('✅ Autoscout is working!');
  } catch (error) {
    console.error('❌ Autoscout test failed:', error);
  }
}

testAutoscout();