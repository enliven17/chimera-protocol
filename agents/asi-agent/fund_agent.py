#!/usr/bin/env python3
"""
Fund ASI Alliance Agent Script
Adds FET tokens to agent wallet for operations
"""

import asyncio
import os
from typing import Optional
from uagents import Agent
from uagents.setup import fund_agent_if_low

# Try to import cosmpy for advanced balance checking
try:
    from cosmpy.aerial.client import LedgerClient
    from cosmpy.aerial.config import NetworkConfig
    COSMPY_AVAILABLE = True
except ImportError:
    COSMPY_AVAILABLE = False
    print("⚠️ CosmPy not available - using basic funding only")

class AgentFunder:
    """Handles funding of ASI Alliance agents"""
    
    def __init__(self):
        if COSMPY_AVAILABLE:
            # Network configuration for Fetch.ai testnet
            self.network_config = NetworkConfig(
                chain_id="dorado-1",
                url="grpc+https://grpc-dorado.fetch.ai:443",
                fee_minimum_gas_price=5000000000,
                fee_denomination="atestfet",
                staking_denomination="atestfet"
            )
            
            self.client = LedgerClient(self.network_config)
        else:
            self.client = None
    
    def create_agent_wallet(self, seed: str) -> tuple[Agent, str]:
        """Create agent and return wallet address"""
        
        agent = Agent(
            name="temp-agent",
            seed=seed,
            port=8000,
            endpoint=["http://127.0.0.1:8000/submit"]
        )
        
        return agent, agent.wallet.address()
    
    def get_agent_balance(self, address: str) -> int:
        """Get agent's current FET balance"""
        
        if not COSMPY_AVAILABLE or not self.client:
            print("⚠️ Balance checking not available without CosmPy")
            return 0
        
        try:
            balance = self.client.query_bank_balance(address, "atestfet")
            return int(balance)
        except Exception as e:
            print(f"❌ Error getting balance: {e}")
            return 0
    
    def format_balance(self, balance_atestfet: int) -> str:
        """Format balance from atestfet to FET"""
        
        fet_balance = balance_atestfet / 1e18
        return f"{fet_balance:.6f} FET"
    
    async def fund_agent_auto(self, agent: Agent) -> bool:
        """Automatically fund agent if balance is low"""
        
        try:
            print(f"🔍 Checking balance for agent: {agent.address}")
            
            # Check current balance
            current_balance = self.get_agent_balance(agent.address)
            print(f"💰 Current balance: {self.format_balance(current_balance)}")
            
            # Minimum balance threshold (0.1 FET)
            min_balance = int(0.1 * 1e18)
            
            if current_balance < min_balance:
                print(f"⚠️ Balance below threshold ({self.format_balance(min_balance)})")
                print("🚰 Requesting funds from testnet faucet...")
                
                # Use uAgents built-in funding
                fund_agent_if_low(agent.wallet.address())
                
                # Wait a bit for funding to complete
                await asyncio.sleep(5)
                
                # Check new balance
                new_balance = self.get_agent_balance(agent.address)
                print(f"💰 New balance: {self.format_balance(new_balance)}")
                
                if new_balance > current_balance:
                    print("✅ Agent funded successfully!")
                    return True
                else:
                    print("❌ Funding failed or still pending")
                    return False
            else:
                print("✅ Agent has sufficient balance")
                return True
                
        except Exception as e:
            print(f"❌ Error funding agent: {e}")
            return False
    
    async def fund_multiple_agents(self, seeds: list[str]) -> dict[str, bool]:
        """Fund multiple agents"""
        
        results = {}
        
        for seed in seeds:
            print(f"\n{'='*50}")
            print(f"🤖 Processing agent with seed: {seed}")
            
            agent, address = self.create_agent_wallet(seed)
            success = await self.fund_agent_auto(agent)
            results[seed] = success
        
        return results
    
    def get_faucet_info(self) -> str:
        """Get information about manual faucet funding"""
        
        return """
🚰 Manual Faucet Funding Options:

1. **Fetch.ai Testnet Faucet**
   - URL: https://faucet-dorado.fetch.ai/
   - Network: Dorado Testnet
   - Amount: 10 FET per request
   - Cooldown: 24 hours

2. **Alternative Faucets**
   - Discord: Join Fetch.ai Discord for faucet bot
   - Telegram: @FetchAI_Bot for testnet tokens

3. **Manual Steps**:
   1. Copy your agent address
   2. Visit the faucet website
   3. Paste address and request tokens
   4. Wait for confirmation (usually 1-2 minutes)

⚠️ Note: Testnet tokens have no real value and are only for testing.
"""

async def main():
    """Main funding function"""
    
    import argparse
    
    parser = argparse.ArgumentParser(description="Fund ASI Alliance agents")
    parser.add_argument("--seed", help="Agent seed to fund")
    parser.add_argument("--all", action="store_true", help="Fund all ChimeraProtocol agents")
    parser.add_argument("--check-only", action="store_true", help="Only check balances")
    parser.add_argument("--faucet-info", action="store_true", help="Show manual faucet information")
    
    args = parser.parse_args()
    
    funder = AgentFunder()
    
    if args.faucet_info:
        print(funder.get_faucet_info())
        return
    
    # Default agent seeds for ChimeraProtocol
    chimera_seeds = [
        "chimera_agentverse_seed_2024",      # Main Agentverse agent
        "chimera_chat_protocol_2024",        # Enhanced chat agent
        "chimera_market_agent_seed_2024"     # Market analyzer agent
    ]
    
    if args.seed:
        # Fund specific agent
        print("🚀 Funding specific agent...")
        agent, address = funder.create_agent_wallet(args.seed)
        
        if args.check_only:
            balance = funder.get_agent_balance(address)
            print(f"💰 Agent balance: {funder.format_balance(balance)}")
            print(f"📍 Agent address: {address}")
        else:
            success = await funder.fund_agent_auto(agent)
            if success:
                print("🎉 Agent funding completed!")
            else:
                print("❌ Agent funding failed!")
                print("\n" + funder.get_faucet_info())
    
    elif args.all:
        # Fund all ChimeraProtocol agents
        print("🚀 Funding all ChimeraProtocol agents...")
        
        if args.check_only:
            for seed in chimera_seeds:
                agent, address = funder.create_agent_wallet(seed)
                balance = funder.get_agent_balance(address)
                print(f"🤖 {seed}")
                print(f"   📍 Address: {address}")
                print(f"   💰 Balance: {funder.format_balance(balance)}")
                print()
        else:
            results = await funder.fund_multiple_agents(chimera_seeds)
            
            print(f"\n{'='*50}")
            print("📊 Funding Results Summary:")
            
            for seed, success in results.items():
                status = "✅ Success" if success else "❌ Failed"
                print(f"   {seed}: {status}")
            
            failed_count = sum(1 for success in results.values() if not success)
            if failed_count > 0:
                print(f"\n⚠️ {failed_count} agents failed to fund automatically.")
                print("💡 Try manual funding using the faucet information:")
                print(funder.get_faucet_info())
    
    else:
        # Show help and agent addresses
        print("🤖 ChimeraProtocol ASI Alliance Agents")
        print("=" * 40)
        
        for i, seed in enumerate(chimera_seeds, 1):
            agent, address = funder.create_agent_wallet(seed)
            balance = funder.get_agent_balance(address)
            
            print(f"{i}. Agent: {seed}")
            print(f"   📍 Address: {address}")
            print(f"   💰 Balance: {funder.format_balance(balance)}")
            print()
        
        print("Usage examples:")
        print("  python fund_agent.py --all                    # Fund all agents")
        print("  python fund_agent.py --check-only --all       # Check all balances")
        print("  python fund_agent.py --seed your_seed         # Fund specific agent")
        print("  python fund_agent.py --faucet-info            # Manual faucet info")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Funding cancelled by user")
    except Exception as e:
        print(f"\n❌ Funding error: {e}")
        print("\n💡 Try manual funding using the testnet faucet:")
        print("   https://faucet-dorado.fetch.ai/")