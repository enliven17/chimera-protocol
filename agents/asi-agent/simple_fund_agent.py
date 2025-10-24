#!/usr/bin/env python3
"""
Simple Agent Funding Script for ChimeraProtocol ASI Agents
"""

import asyncio
from uagents import Agent
from uagents.setup import fund_agent_if_low

def create_and_fund_agent(seed: str, name: str) -> tuple[str, bool]:
    """Create agent and attempt to fund it"""
    
    print(f"\n🤖 Creating agent: {name}")
    print(f"🌱 Seed: {seed}")
    
    try:
        # Create agent
        agent = Agent(
            name=name,
            seed=seed,
            port=8000,
            endpoint=["http://127.0.0.1:8000/submit"]
        )
        
        address = agent.wallet.address()
        print(f"📍 Agent address: {address}")
        
        # Attempt to fund
        print("🚰 Attempting to fund agent...")
        fund_agent_if_low(address)
        
        print("✅ Funding request completed!")
        return address, True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return "", False

def main():
    """Main function"""
    
    print("🚀 ChimeraProtocol ASI Agent Funding")
    print("=" * 50)
    
    # ChimeraProtocol agent configurations
    agents = [
        {
            "seed": "chimera_agentverse_seed_2024",
            "name": "chimera-agentverse-agent"
        },
        {
            "seed": "chimera_chat_protocol_2024", 
            "name": "chimera-chat-agent"
        },
        {
            "seed": "chimera_market_agent_seed_2024",
            "name": "chimera-market-agent"
        }
    ]
    
    results = []
    
    for agent_config in agents:
        address, success = create_and_fund_agent(
            agent_config["seed"], 
            agent_config["name"]
        )
        
        results.append({
            "name": agent_config["name"],
            "address": address,
            "success": success
        })
    
    # Summary
    print(f"\n{'='*50}")
    print("📊 Funding Summary:")
    
    for result in results:
        status = "✅ Success" if result["success"] else "❌ Failed"
        print(f"   {result['name']}: {status}")
        if result["address"]:
            print(f"      📍 {result['address']}")
    
    # Manual funding instructions
    print(f"\n💡 Manual Funding Instructions:")
    print("If automatic funding failed, you can fund manually:")
    print()
    print("1. Visit: https://faucet-dorado.fetch.ai/")
    print("2. Copy the agent address from above")
    print("3. Paste it in the faucet and request tokens")
    print("4. Wait 1-2 minutes for confirmation")
    print()
    print("Alternative faucets:")
    print("- Discord: Join Fetch.ai Discord for faucet bot")
    print("- Telegram: @FetchAI_Bot")
    print()
    print("⚠️ Note: You need testnet FET tokens for agents to operate")
    print("💰 Recommended: 1-10 FET per agent for testing")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Funding cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Try manual funding at: https://faucet-dorado.fetch.ai/")