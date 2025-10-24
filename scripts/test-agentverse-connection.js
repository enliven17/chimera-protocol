#!/usr/bin/env node

/**
 * Test Agentverse Agent Connection
 * Tests the connection to our deployed Agentverse agent
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const AGENT_ADDRESS = 'agent1q0xt9xwp9924knna6hh4qnqwmlusxuvl8vcyh6pg3wfjgqa2ucefu46flzn';
const AGENTVERSE_API_KEY = process.env.AGENTVERSE_API_KEY;

async function testAgentverseConnection() {
  console.log('🤖 Testing Agentverse Agent Connection...');
  console.log(`📍 Agent Address: ${AGENT_ADDRESS}`);
  console.log(`🔑 API Key: ${AGENTVERSE_API_KEY ? 'Present' : 'Missing'}`);
  
  if (!AGENTVERSE_API_KEY) {
    console.error('❌ AGENTVERSE_API_KEY not found in environment variables');
    return;
  }

  // Test different API endpoints (ASI:One compatible)
  const endpoints = [
    {
      name: 'Search Agents (Public)',
      url: 'https://agentverse.ai/v1/search/agents',
      method: 'POST',
      body: {},
      requiresAuth: false
    },
    {
      name: 'Submit API (Correct Endpoint)',
      url: 'https://agentverse.ai/v1/submit',
      method: 'POST',
      body: {
        version: 42,
        sender: "web-user",
        target: AGENT_ADDRESS,
        session: "test-session",
        schema_digest: "foo",
        protocol_digest: "foo",
        payload: "Hello from ChimeraProtocol! Can you analyze markets?"
      }
    },
    {
      name: 'Chat Protocol v1beta1',
      url: `https://agentverse.ai/v1beta1/agents/${AGENT_ADDRESS}/chat`,
      method: 'POST',
      body: {
        text: 'Hello from ChimeraProtocol! Can you analyze markets?',
        session_id: 'test-session',
        user_id: 'test-user'
      }
    },
    {
      name: 'Mailbox Protocol',
      url: `https://agentverse.ai/v1/agents/${AGENT_ADDRESS}/mailbox`,
      method: 'POST',
      body: {
        protocol: 'Chat',
        payload: {
          text: 'Hello! Test message from ChimeraProtocol.',
          user_id: 'test-user'
        }
      }
    },
    {
      name: 'Agent Info',
      url: `https://agentverse.ai/v1/agents/${AGENT_ADDRESS}`,
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔄 Testing ${endpoint.name}...`);
    console.log(`📡 URL: ${endpoint.url}`);
    
    try {
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ChimeraProtocol/1.0'
        },
        timeout: 10000
      };

      // Add authorization header only if required
      if (endpoint.requiresAuth !== false) {
        options.headers['Authorization'] = `Bearer ${AGENTVERSE_API_KEY}`;
      }

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
        console.log(`📤 Payload:`, endpoint.body);
      }

      const response = await fetch(endpoint.url, options);
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Response:', JSON.stringify(data, null, 2));
        
        // If this is the search endpoint, look for our agent
        if (endpoint.name === 'Search Agents (Public)' && data.agents) {
          const ourAgent = data.agents.find(agent => 
            agent.address === AGENT_ADDRESS || 
            agent.name?.includes('chimera') ||
            agent.name?.includes('market-analyzer')
          );
          
          if (ourAgent) {
            console.log('🎯 Found our agent in search results!', ourAgent);
          } else {
            console.log('🔍 Our agent not found in public search results');
            console.log(`📍 Looking for: ${AGENT_ADDRESS}`);
          }
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Error Response:', errorText);
      }
      
    } catch (error) {
      console.error(`❌ Request failed:`, error.message);
    }
  }

  // Test direct web URL
  console.log(`\n🌐 Direct Chat URL: https://agentverse.ai/agents/${AGENT_ADDRESS}`);
  console.log('💡 You can test the agent directly by visiting the URL above');
}

async function testLocalAPIRoute() {
  console.log('\n🔄 Testing local API route...');
  
  try {
    const response = await fetch('http://localhost:3000/api/asi-agent/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Test from local API route.',
        conversationId: 'test-conversation',
        sessionId: 'test-session',
        userId: 'test-user'
      })
    });

    console.log(`📊 Local API Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Local API Success:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Local API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Local API failed:', error.message);
    console.log('💡 Make sure the Next.js dev server is running on port 3000');
  }
}

async function main() {
  console.log('🚀 ChimeraProtocol Agentverse Connection Test\n');
  
  await testAgentverseConnection();
  await testLocalAPIRoute();
  
  console.log('\n✨ Test completed!');
  console.log('\n📋 Summary:');
  console.log('• If Agentverse API calls succeed, the integration is working');
  console.log('• If they fail, users can still chat directly via the web URL');
  console.log('• The frontend will show the direct chat link when API fails');
  console.log(`• Direct chat: https://agentverse.ai/agents/${AGENT_ADDRESS}`);
}

main().catch(console.error);