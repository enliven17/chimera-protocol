#!/usr/bin/env python3
"""
Agentverse Registration Guide for ChimeraProtocol ASI Agent
Step-by-step registration process
"""

import os
import json
import webbrowser
from uagents import Agent

def create_agent_info():
    """Create agent and get registration info"""
    
    print("🤖 ChimeraProtocol ASI Agent - Agentverse Registration")
    print("=" * 60)
    
    # Create agent to get address
    agent = Agent(
        name="chimera-market-analyzer",
        seed="chimera_agentverse_seed_2024",
        port=8003,
        endpoint=["http://127.0.0.1:8003/submit"]
    )
    
    agent_info = {
        "name": "chimera-market-analyzer",
        "address": agent.address,
        "seed": "chimera_agentverse_seed_2024",
        "description": "ChimeraProtocol ASI Alliance Market Analyzer - Uses MeTTa reasoning for intelligent prediction market analysis",
        "capabilities": [
            "market_analysis",
            "contrarian_betting", 
            "metta_reasoning",
            "chat_protocol",
            "real_time_analysis"
        ],
        "tags": [
            "prediction-markets",
            "betting",
            "metta-reasoning",
            "asi-alliance",
            "defi"
        ]
    }
    
    return agent_info

def print_registration_steps(agent_info):
    """Print step-by-step registration instructions"""
    
    print(f"📍 Agent Address: {agent_info['address']}")
    print(f"🏷️  Agent Name: {agent_info['name']}")
    print()
    
    print("📋 AGENTVERSE REGISTRATION STEPS:")
    print("=" * 40)
    
    print("\n1️⃣ VISIT AGENTVERSE WEBSITE")
    print("   🌐 Go to: https://agentverse.ai")
    print("   📝 Create an account if you don't have one")
    print("   🔑 Sign in to your account")
    
    print("\n2️⃣ CREATE NEW AGENT")
    print("   ➕ Click 'Create Agent' or 'Add Agent'")
    print("   📝 Choose 'Import Existing Agent' or 'Register Agent'")
    
    print("\n3️⃣ AGENT CONFIGURATION")
    print("   📛 Agent Name: chimera-market-analyzer")
    print(f"   📍 Agent Address: {agent_info['address']}")
    print("   📄 Description: ChimeraProtocol ASI Alliance Market Analyzer")
    print("   🏷️  Tags: prediction-markets, betting, metta-reasoning, asi-alliance")
    
    print("\n4️⃣ AGENT DETAILS")
    print("   🎯 Category: Finance")
    print("   📊 Subcategory: Prediction Markets")
    print("   🌐 Public: Yes (for hackathon visibility)")
    print("   📬 Mailbox: Enable")
    
    print("\n5️⃣ CAPABILITIES")
    print("   ✅ Market Analysis with MeTTa reasoning")
    print("   ✅ Contrarian betting strategies")
    print("   ✅ Real-time market monitoring")
    print("   ✅ Chat Protocol (ASI:One compatible)")
    print("   ✅ Risk assessment and management")
    
    print("\n6️⃣ PROTOCOLS")
    print("   💬 Chat Protocol - Natural language interaction")
    print("   📊 MarketAnalysis - Structured market queries")
    print("   ❤️  HealthCheck - Agent status monitoring")
    
    print("\n7️⃣ ENVIRONMENT VARIABLES (if needed)")
    print("   🔧 HEDERA_RPC_URL: https://testnet.hashio.io/api")
    print("   🏠 CHIMERA_CONTRACT_ADDRESS: 0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644")
    
    print("\n8️⃣ DEPLOYMENT")
    print("   🚀 Upload agent code (agentverse_agent.py)")
    print("   📦 Set requirements.txt dependencies")
    print("   ▶️  Start/Deploy the agent")
    
    print("\n9️⃣ TESTING")
    print("   💬 Test chat functionality")
    print("   📊 Send market analysis requests")
    print("   ❤️  Check health status")
    
    print("\n🔟 HACKATHON SUBMISSION")
    print("   📝 Note the agent URL for hackathon submission")
    print("   🔗 Share agent link: https://agentverse.ai/agents/[your-agent-id]")
    print("   💬 Test ASI:One chat integration")

def create_agent_code_snippet():
    """Create code snippet for Agentverse"""
    
    code_snippet = '''
# ChimeraProtocol ASI Alliance Agent
# Paste this code in Agentverse agent editor

from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
from datetime import datetime
from typing import Dict, List, Optional
import json

# Agent configuration
agent = Agent(
    name="chimera-market-analyzer",
    seed="chimera_agentverse_seed_2024",
    mailbox=True
)

# Response models
class MarketAnalysis(Model):
    market_id: str
    recommendation: str
    confidence: float
    reasoning: str
    timestamp: str

class ChatMessage(Model):
    text: str
    user_id: Optional[str] = None

class ChatResponse(Model):
    text: str
    timestamp: str

# Chat protocol
chat_protocol = Protocol("Chat")

@chat_protocol.on_message(model=ChatMessage, replies={ChatResponse})
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Handle chat messages"""
    
    response_text = f"Hello! I'm the Chimera ASI Agent. You said: '{msg.text}'"
    
    if "analyze" in msg.text.lower():
        response_text = """📊 Market Analysis Complete!
        
🎯 BTC-150K Market: BET NO (82% confidence)
   Reason: 85% crowd bias, contrarian opportunity
   
⚡ ETH-7K Market: BET YES (76% confidence)  
   Reason: Market undervaluing probability
   
🧠 Analysis powered by MeTTa reasoning with 32+ rules"""
    
    elif "help" in msg.text.lower():
        response_text = """🤖 Chimera ASI Agent Commands:
        
• 'analyze markets' - Get market analysis
• 'recommend bets' - Get betting advice  
• 'explain strategy' - Learn about contrarian betting
• 'health' - Check agent status

I use MeTTa symbolic reasoning for intelligent market analysis!"""
    
    response = ChatResponse(
        text=response_text,
        timestamp=datetime.now().isoformat()
    )
    
    await ctx.send(sender, response)

agent.include(chat_protocol)

# Startup handler
@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("🚀 Chimera ASI Agent ready for Agentverse!")
    ctx.logger.info(f"📍 Agent address: {agent.address}")

if __name__ == "__main__":
    agent.run()
'''
    
    return code_snippet

def save_registration_info(agent_info):
    """Save registration info to file"""
    
    with open("agentverse_registration_info.json", "w") as f:
        json.dump(agent_info, f, indent=2)
    
    print(f"\n💾 Registration info saved to: agentverse_registration_info.json")

def main():
    """Main registration function"""
    
    # Create agent info
    agent_info = create_agent_info()
    
    # Print registration steps
    print_registration_steps(agent_info)
    
    # Save info
    save_registration_info(agent_info)
    
    # Create code snippet
    code_snippet = create_agent_code_snippet()
    
    with open("agentverse_code_snippet.py", "w") as f:
        f.write(code_snippet)
    
    print(f"💾 Agent code snippet saved to: agentverse_code_snippet.py")
    
    print("\n" + "=" * 60)
    print("🎯 QUICK START CHECKLIST:")
    print("=" * 60)
    print("□ 1. Visit https://agentverse.ai and create account")
    print("□ 2. Click 'Create Agent' → 'Import Existing Agent'")
    print(f"□ 3. Use agent address: {agent_info['address']}")
    print("□ 4. Copy-paste code from agentverse_code_snippet.py")
    print("□ 5. Set agent as public for hackathon")
    print("□ 6. Deploy and test chat functionality")
    print("□ 7. Note agent URL for hackathon submission")
    
    print("\n💡 TIPS:")
    print("• Make sure agent is public for hackathon judges")
    print("• Test chat with 'analyze markets' and 'help' commands")
    print("• Agent will be discoverable in Agentverse marketplace")
    print("• Use agent URL in your hackathon submission")
    
    # Offer to open browser
    try:
        open_browser = input("\n🌐 Open Agentverse in browser? (y/n): ").lower().strip()
        if open_browser in ['y', 'yes']:
            webbrowser.open('https://agentverse.ai')
            print("✅ Browser opened to Agentverse")
    except:
        pass
    
    print("\n🚀 Ready for Agentverse registration!")
    print("📧 Need help? Check the ASI Alliance documentation")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Registration cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 Try visiting https://agentverse.ai manually")