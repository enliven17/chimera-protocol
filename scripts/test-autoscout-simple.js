import axios from 'axios';
import "dotenv/config";

async function testAutoscout() {
  console.log('🔍 Testing Autoscout Explorer...');
  
  const baseUrl = 'https://chimera.cloud.blockscout.com';
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  
  try {
    // Test API endpoint
    console.log(`📡 Testing API: ${baseUrl}/api/v2/addresses/${chimeraAddress}`);
    
    const response = await axios.get(`${baseUrl}/api/v2/addresses/${chimeraAddress}`, {
      timeout: 10000
    });
    
    console.log('✅ Autoscout API is working!');
    console.log(`📊 Contract Info:`, {
      address: response.data.hash,
      verified: response.data.is_verified,
      transactions: response.data.transactions_count
    });
    
    // Test transactions endpoint
    const txResponse = await axios.get(`${baseUrl}/api/v2/addresses/${chimeraAddress}/transactions`, {
      params: { limit: 5 }
    });
    
    console.log(`🔄 Recent Transactions: ${txResponse.data.items?.length || 0}`);
    
    console.log(`🔗 Explorer URL: ${baseUrl}/address/${chimeraAddress}`);
    
  } catch (error) {
    console.error('❌ Autoscout test failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔄 Autoscout might still be deploying...');
    }
  }
}

testAutoscout();