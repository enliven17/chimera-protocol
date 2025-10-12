"""
ChimeraProtocol ASI Alliance Market Analyzer Agent
Uses MeTTa reasoning and Envio data to make intelligent betting decisions
"""

import asyncio
import json
import requests
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

# ASI Alliance imports (as specified in eth.md)
from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
from uagents.network import wait_for_tx_to_complete

# MeTTa reasoning engine (placeholder - actual implementation would use SingularityNET)
class MeTTaReasoner:
    """MeTTa-based reasoning engine for market analysis"""
    
    def __init__(self):
        self.knowledge_base = {
            "market_patterns": [],
            "price_trends": [],
            "sentiment_data": []
        }
    
    def analyze_market_data(self, market_data: Dict) -> Dict:
        """Analyze market data using MeTTa reasoning (as specified in eth.md)"""
        
        # MeTTa-based strategic reasoning for contrarian betting strategy
        analysis = {
            "confidence": 0.0,
            "recommendation": "HOLD",  # BUY_A, BUY_B, HOLD
            "reasoning": "",
            "risk_level": "MEDIUM",
            "metta_analysis": "Contrarian strategy based on market imbalance"
        }
        
        # Market volume analysis
        total_volume = market_data.get("totalPool", 0)
        option_a_ratio = market_data.get("optionARatio", 0.5)
        option_b_ratio = 1 - option_a_ratio
        
        # Simple contrarian strategy
        if option_a_ratio > 0.7:
            analysis["recommendation"] = "BUY_B"
            analysis["confidence"] = min(0.8, (option_a_ratio - 0.5) * 2)
            analysis["reasoning"] = f"Contrarian bet: Option A heavily favored ({option_a_ratio:.1%})"
        elif option_b_ratio > 0.7:
            analysis["recommendation"] = "BUY_A"
            analysis["confidence"] = min(0.8, (option_b_ratio - 0.5) * 2)
            analysis["reasoning"] = f"Contrarian bet: Option B heavily favored ({option_b_ratio:.1%})"
        else:
            analysis["recommendation"] = "HOLD"
            analysis["reasoning"] = "Market appears balanced, waiting for better opportunity"
        
        # Risk assessment
        if total_volume < 1000:  # Low volume = high risk
            analysis["risk_level"] = "HIGH"
        elif total_volume > 10000:  # High volume = lower risk
            analysis["risk_level"] = "LOW"
        
        return analysis

@dataclass
class MarketData:
    """Market data structure"""
    id: int
    title: str
    total_pool: int
    option_a_shares: int
    option_b_shares: int
    end_time: datetime
    market_type: str
    status: str

class EnvioDataFetcher:
    """Fetches market data from Envio HyperIndex"""
    
    def __init__(self, envio_endpoint: str):
        self.endpoint = envio_endpoint
    
    async def get_active_markets(self) -> List[MarketData]:
        """Fetch active markets from Envio"""
        
        query = """
        query GetActiveMarkets {
          markets(where: {status: 0, resolved: false}) {
            id
            marketId
            title
            totalPool
            totalOptionAShares
            totalOptionBShares
            createdAt
            updatedAt
            marketType
            status
          }
        }
        """
        
        try:
            response = requests.post(
                self.endpoint,
                json={"query": query},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                markets = []
                
                for market in data.get("data", {}).get("markets", []):
                    markets.append(MarketData(
                        id=int(market["marketId"]),
                        title=market["title"],
                        total_pool=int(market["totalPool"]),
                        option_a_shares=int(market["totalOptionAShares"]),
                        option_b_shares=int(market["totalOptionBShares"]),
                        end_time=datetime.fromtimestamp(int(market["updatedAt"])),
                        market_type=market["marketType"],
                        status=market["status"]
                    ))
                
                return markets
            else:
                print(f"Error fetching markets: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error fetching markets: {e}")
            return []
    
    async def get_market_history(self, market_id: int) -> List[Dict]:
        """Get betting history for a specific market"""
        
        query = f"""
        query GetMarketHistory {{
          betPlacedEvents(where: {{marketId: {market_id}}}) {{
            id
            user
            agent
            option
            amount
            shares
            blockTimestamp
          }}
        }}
        """
        
        try:
            response = requests.post(
                self.endpoint,
                json={"query": query},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("data", {}).get("betPlacedEvents", [])
            else:
                return []
                
        except Exception as e:
            print(f"Error fetching market history: {e}")
            return []

class ChimeraAgent:
    """Main ChimeraProtocol ASI Agent"""
    
    def __init__(self, envio_endpoint: str, lit_protocol_endpoint: str):
        self.agent = Agent(
            name="chimera_market_analyzer",
            seed="chimera_secret_seed_phrase_here",
            port=8001,
            endpoint=["http://localhost:8001/submit"]
        )
        
        self.envio_fetcher = EnvioDataFetcher(envio_endpoint)
        self.metta_reasoner = MeTTaReasoner()
        self.lit_endpoint = lit_protocol_endpoint
        
        # Agent configuration
        self.max_bet_amount = 100  # Maximum bet per transaction
        self.min_confidence = 0.6  # Minimum confidence to place bet
        self.analysis_interval = 300  # Analyze markets every 5 minutes
        
        self.setup_protocols()
    
    def setup_protocols(self):
        """Setup agent protocols and behaviors"""
        
        market_analysis_protocol = Protocol("MarketAnalysis")
        
        @market_analysis_protocol.on_interval(period=self.analysis_interval)
        async def analyze_markets(ctx: Context):
            """Periodic market analysis"""
            ctx.logger.info("🔍 Starting market analysis...")
            
            try:
                # Fetch active markets
                markets = await self.envio_fetcher.get_active_markets()
                ctx.logger.info(f"📊 Found {len(markets)} active markets")
                
                for market in markets:
                    await self.analyze_single_market(ctx, market)
                    
            except Exception as e:
                ctx.logger.error(f"❌ Error in market analysis: {e}")
        
        self.agent.include(market_analysis_protocol)
    
    async def analyze_single_market(self, ctx: Context, market: MarketData):
        """Analyze a single market and potentially place bet"""
        
        ctx.logger.info(f"🎯 Analyzing market: {market.title}")
        
        # Calculate market ratios
        total_shares = market.option_a_shares + market.option_b_shares
        if total_shares == 0:
            return
        
        option_a_ratio = market.option_a_shares / total_shares
        
        market_data = {
            "totalPool": market.total_pool,
            "optionARatio": option_a_ratio,
            "totalShares": total_shares,
            "marketType": market.market_type
        }
        
        # Get MeTTa analysis
        analysis = self.metta_reasoner.analyze_market_data(market_data)
        
        ctx.logger.info(f"🧠 Analysis: {analysis['recommendation']} "
                       f"(confidence: {analysis['confidence']:.2f})")
        ctx.logger.info(f"💭 Reasoning: {analysis['reasoning']}")
        
        # Check if we should place a bet
        if (analysis["confidence"] >= self.min_confidence and 
            analysis["recommendation"] in ["BUY_A", "BUY_B"]):
            
            # Calculate bet amount based on confidence
            bet_amount = int(self.max_bet_amount * analysis["confidence"])
            option = 0 if analysis["recommendation"] == "BUY_A" else 1
            
            await self.place_bet_via_lit(ctx, market.id, option, bet_amount, analysis)
    
    async def place_bet_via_lit(self, ctx: Context, market_id: int, option: int, 
                               amount: int, analysis: Dict):
        """Place bet through Lit Protocol Vincent Skill"""
        
        ctx.logger.info(f"🎲 Placing bet: Market {market_id}, "
                       f"Option {option}, Amount {amount}")
        
        # Prepare Lit Protocol action
        lit_action = {
            "type": "place_bet",
            "market_id": market_id,
            "option": option,
            "amount": amount,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            # Send to Lit Protocol (placeholder - actual implementation would use Lit SDK)
            response = requests.post(
                f"{self.lit_endpoint}/execute_action",
                json=lit_action,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                ctx.logger.info("✅ Bet placed successfully via Lit Protocol")
            else:
                ctx.logger.error(f"❌ Failed to place bet: {response.status_code}")
                
        except Exception as e:
            ctx.logger.error(f"❌ Error placing bet via Lit: {e}")
    
    def run(self):
        """Start the agent"""
        print("🚀 Starting ChimeraProtocol ASI Agent...")
        print(f"📡 Envio endpoint: {self.envio_fetcher.endpoint}")
        print(f"🔒 Lit Protocol endpoint: {self.lit_endpoint}")
        print(f"💰 Max bet amount: {self.max_bet_amount}")
        print(f"🎯 Min confidence: {self.min_confidence}")
        
        self.agent.run()

if __name__ == "__main__":
    # Configuration from environment
    import os
    ENVIO_ENDPOINT = os.getenv("ENVIO_INDEXER_URL", "http://localhost:8080/v1/graphql")
    LIT_PROTOCOL_ENDPOINT = os.getenv("LIT_PROTOCOL_ENDPOINT", "http://localhost:3001")
    
    print("🚀 Starting ChimeraProtocol ASI Alliance Agent...")
    print(f"📡 Envio endpoint: {ENVIO_ENDPOINT}")
    print(f"🔒 Lit Protocol endpoint: {LIT_PROTOCOL_ENDPOINT}")
    
    # Create and run agent
    agent = ChimeraAgent(ENVIO_ENDPOINT, LIT_PROTOCOL_ENDPOINT)
    
    try:
        agent.run()
    except KeyboardInterrupt:
        print("\n👋 Agent stopped by user")
    except Exception as e:
        print(f"\n❌ Agent error: {e}")
        raise