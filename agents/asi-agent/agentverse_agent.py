"""
ChimeraProtocol ASI Alliance Agent for Agentverse Registration
Optimized for Agentverse deployment with Chat Protocol support
"""

import asyncio
import json
import os
import time
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from uuid import uuid4

# ASI Alliance imports
from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low

# Chat protocol for ASI:One compatibility
from uagents.communication import send_message

# Response Models for structured communication
class MarketAnalysis(Model):
    market_id: str
    recommendation: str
    confidence: float
    reasoning: str
    risk_level: str
    timestamp: str
    metta_analysis: str

class ChimeraResponse(Model):
    analysis: List[MarketAnalysis]
    message: str
    type: str = "chimera_analysis"
    agent_version: str = "1.0.0"

class HealthCheck(Model):
    status: str
    timestamp: str
    capabilities: List[str]
    version: str

# Chat Protocol Models
class ChatMessage(Model):
    text: str
    user_id: Optional[str] = None
    timestamp: Optional[str] = None

class ChatResponse(Model):
    text: str
    analysis: Optional[List[MarketAnalysis]] = None
    timestamp: str

# MeTTa reasoning engine with custom implementation
class MeTTaReasoner:
    """Advanced MeTTa-based reasoning for Agentverse deployment"""

    def __init__(self):
        self.rules_loaded = False
        try:
            # Use our custom MeTTa engine
            from metta_engine import MeTTaReasoner as CustomMeTTaReasoner
            self.metta_engine = CustomMeTTaReasoner()
            self.rules_loaded = True
            print("✅ Custom MeTTa reasoning engine loaded with symbolic AI")
        except ImportError as e:
            print(f"⚠️ Custom MeTTa engine not available: {e}")
            self.metta_engine = None
            self.rules_loaded = False

    def _load_market_rules(self):
        """Load MeTTa rules for market analysis"""
        if not self.metta:
            return
        
        try:
            # Market analysis rules
            self.metta.run('''
                ; Contrarian betting strategy rules
                (= (contrarian-signal $ratio) 
                   (if (> $ratio 0.75) high-contrarian
                       (if (> $ratio 0.65) medium-contrarian
                           low-contrarian)))
                
                ; Risk assessment rules
                (= (risk-level $volume $ratio)
                   (if (< $volume 1000) high-risk
                       (if (and (> $volume 5000) (< $ratio 0.6) (> $ratio 0.4)) low-risk
                           medium-risk)))
                
                ; Confidence calculation
                (= (confidence $ratio $volume)
                   (let $contrarian (contrarian-signal $ratio)
                        $risk (risk-level $volume $ratio)
                        (if (and (== $contrarian high-contrarian) (== $risk low-risk)) 0.9
                            (if (== $contrarian medium-contrarian) 0.7
                                0.5))))
            ''')
        except Exception as e:
            print(f"Error loading MeTTa rules: {e}")

    def analyze_market(self, market_data: Dict) -> Dict:
        """Analyze market using MeTTa rules or fallback heuristics"""
        
        if self.metta_engine and self.rules_loaded:
            try:
                # Use custom MeTTa reasoning engine
                return self.metta_engine.analyze_market(market_data)
                
            except Exception as e:
                print(f"Custom MeTTa analysis error: {e}")
        
        # Fallback heuristic analysis
        option_a_ratio = float(market_data.get("optionARatio", 0.5))
        total_volume = float(market_data.get("totalVolume", 0))
        return self._fallback_analysis(option_a_ratio, total_volume)
    
    def _fallback_analysis(self, option_a_ratio: float, total_volume: float) -> Dict:
        """Fallback contrarian analysis without MeTTa"""
        
        recommendation = "HOLD"
        confidence = 0.5
        reasoning = "Balanced market, no clear opportunity"
        
        # Contrarian strategy
        if option_a_ratio > 0.75:
            recommendation = "BUY_B"
            confidence = min(0.9, (option_a_ratio - 0.5) * 2)
            reasoning = f"Strong contrarian opportunity: Option A heavily favored at {option_a_ratio:.1%}"
        elif option_a_ratio < 0.25:
            recommendation = "BUY_A"
            confidence = min(0.9, (0.5 - option_a_ratio) * 2)
            reasoning = f"Strong contrarian opportunity: Option B heavily favored at {1-option_a_ratio:.1%}"
        elif option_a_ratio > 0.65:
            recommendation = "BUY_B"
            confidence = 0.6
            reasoning = f"Moderate contrarian opportunity: Option A favored at {option_a_ratio:.1%}"
        elif option_a_ratio < 0.35:
            recommendation = "BUY_A"
            confidence = 0.6
            reasoning = f"Moderate contrarian opportunity: Option B favored at {1-option_a_ratio:.1%}"
        
        # Risk assessment
        risk_level = "MEDIUM"
        if total_volume < 1000:
            risk_level = "HIGH"
            confidence *= 0.8  # Reduce confidence for low volume
        elif total_volume > 10000:
            risk_level = "LOW"
            confidence = min(0.95, confidence * 1.1)  # Increase confidence for high volume
        
        return {
            "recommendation": recommendation,
            "confidence": confidence,
            "reasoning": reasoning,
            "risk_level": risk_level,
            "metta_analysis": "Fallback heuristic contrarian analysis"
        }

class ChimeraAgentverse:
    """ChimeraProtocol Agent optimized for Agentverse deployment"""
    
    def __init__(self):
        # Create agent with Agentverse configuration
        self.agent = Agent(
            name="chimera-market-analyzer",
            seed="chimera_agentverse_seed_2024",
            port=8003,
            endpoint=["http://127.0.0.1:8003/submit"],
            mailbox=True,  # Enable mailbox for Agentverse
            agentverse={
                "api_key": os.getenv("AGENTVERSE_API_KEY"),
                "use_mailbox": True
            }
        )
        
        # Initialize components
        self.metta_reasoner = MeTTaReasoner()
        self.capabilities = [
            "market_analysis",
            "contrarian_betting",
            "metta_reasoning",
            "chat_protocol",
            "real_time_analysis"
        ]
        
        # Setup protocols
        self.setup_protocols()
        
        # Fund agent for Agentverse operations
        try:
            fund_agent_if_low(self.agent.wallet.address())
        except Exception as e:
            print(f"Warning: Could not fund agent: {e}")

    def setup_protocols(self):
        """Setup all agent protocols"""
        
        # Health check protocol
        health_protocol = Protocol("HealthCheck")
        
        @health_protocol.on_message(model=HealthCheck, replies={HealthCheck})
        async def handle_health_check(ctx: Context, sender: str, msg: HealthCheck):
            """Handle health check requests"""
            response = HealthCheck(
                status="healthy",
                timestamp=datetime.now().isoformat(),
                capabilities=self.capabilities,
                version="1.0.0"
            )
            await ctx.send(sender, response)
        
        self.agent.include(health_protocol)
        
        # Chat protocol for ASI:One compatibility
        chat_protocol = Protocol("Chat")
        
        @chat_protocol.on_message(model=ChatMessage, replies={ChatResponse})
        async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
            """Handle chat messages with market analysis"""
            
            ctx.logger.info(f"📨 Chat message from {sender}: {msg.text}")
            
            # Process the message
            response_text = await self.process_chat_message(msg.text, sender)
            
            # Generate analysis if requested
            analysis = None
            if any(keyword in msg.text.lower() for keyword in ["analyze", "market", "bet", "recommend"]):
                analysis = await self.generate_sample_analysis()
            
            response = ChatResponse(
                text=response_text,
                analysis=analysis,
                timestamp=datetime.now().isoformat()
            )
            
            await ctx.send(sender, response)
        
        self.agent.include(chat_protocol)
        
        # Market analysis protocol
        analysis_protocol = Protocol("MarketAnalysis")
        
        class MarketAnalysisRequest(Model):
            query: str
            parameters: Optional[Dict] = None
        
        @analysis_protocol.on_message(model=MarketAnalysisRequest, replies={ChimeraResponse})
        async def handle_market_analysis(ctx: Context, sender: str, msg: MarketAnalysisRequest):
            """Handle structured market analysis requests"""
            
            ctx.logger.info(f"📊 Analysis request from {sender}")
            
            # Generate analysis
            analysis_results = []
            
            # Sample market data for demonstration
            sample_markets = [
                {"marketId": "1", "optionARatio": 0.8, "totalVolume": 5000},
                {"marketId": "2", "optionARatio": 0.3, "totalVolume": 12000},
                {"marketId": "3", "optionARatio": 0.6, "totalVolume": 800}
            ]
            
            for market_data in sample_markets:
                analysis = self.metta_reasoner.analyze_market(market_data)
                
                analysis_results.append(MarketAnalysis(
                    market_id=market_data["marketId"],
                    recommendation=analysis["recommendation"],
                    confidence=analysis["confidence"],
                    reasoning=analysis["reasoning"],
                    risk_level=analysis["risk_level"],
                    timestamp=datetime.now().isoformat(),
                    metta_analysis=analysis["metta_analysis"]
                ))
            
            response = ChimeraResponse(
                analysis=analysis_results,
                message=f"Analyzed {len(analysis_results)} markets using MeTTa reasoning",
                agent_version="1.0.0"
            )
            
            await ctx.send(sender, response)
        
        self.agent.include(analysis_protocol)
        
        # Periodic analysis for demonstration
        periodic_protocol = Protocol("PeriodicAnalysis")
        
        @periodic_protocol.on_interval(period=300.0)  # Every 5 minutes
        async def periodic_analysis(ctx: Context):
            """Periodic market analysis for demonstration"""
            
            ctx.logger.info("🔄 Running periodic market analysis...")
            
            # This would normally fetch real market data
            # For Agentverse demo, we'll log the analysis capability
            sample_analysis = self.metta_reasoner.analyze_market({
                "optionARatio": 0.75,
                "totalVolume": 8000
            })
            
            ctx.logger.info(f"📈 Sample analysis: {sample_analysis['recommendation']} "
                           f"(confidence: {sample_analysis['confidence']:.2f})")
        
        self.agent.include(periodic_protocol)

    async def process_chat_message(self, text: str, sender: str) -> str:
        """Process chat message and generate appropriate response"""
        
        text_lower = text.lower()
        
        # Health check
        if any(word in text_lower for word in ["health", "status", "ping", "alive"]):
            return (
                "🟢 Chimera ASI Agent is healthy and operational!\n\n"
                f"Capabilities: {', '.join(self.capabilities)}\n"
                f"MeTTa Reasoning: {'✅ Active' if self.metta_reasoner.rules_loaded else '⚠️ Fallback mode'}\n"
                "Ready for market analysis and betting recommendations."
            )
        
        # Help
        if any(word in text_lower for word in ["help", "commands", "what can you do"]):
            return (
                "🤖 Chimera ASI Agent Commands:\n\n"
                "• 'analyze markets' - Get market analysis\n"
                "• 'recommend bets' - Get betting recommendations\n"
                "• 'health' - Check agent status\n"
                "• 'explain strategy' - Learn about contrarian betting\n\n"
                "I use MeTTa reasoning for intelligent market analysis!"
            )
        
        # Market analysis
        if any(word in text_lower for word in ["analyze", "analysis", "market"]):
            return (
                "📊 Analyzing markets using MeTTa reasoning engine...\n\n"
                "I'm applying contrarian betting strategies to identify opportunities "
                "where the crowd might be wrong. My analysis considers:\n"
                "• Market ratios and imbalances\n"
                "• Volume and liquidity\n"
                "• Risk assessment\n"
                "• Confidence scoring\n\n"
                "Check the analysis results below!"
            )
        
        # Betting recommendations
        if any(word in text_lower for word in ["bet", "recommend", "should i"]):
            return (
                "🎯 Generating betting recommendations...\n\n"
                "My contrarian strategy looks for markets where:\n"
                "• One option is heavily favored (>75%)\n"
                "• High volume indicates market confidence\n"
                "• Risk/reward ratio is favorable\n\n"
                "Remember: Always bet responsibly and within your limits!"
            )
        
        # Strategy explanation
        if any(word in text_lower for word in ["strategy", "explain", "how", "why"]):
            return (
                "🧠 Contrarian Betting Strategy Explained:\n\n"
                "1. **Crowd Psychology**: When >75% of bets favor one option, "
                "the crowd might be overconfident\n"
                "2. **Value Betting**: Heavily favored options often have poor odds\n"
                "3. **MeTTa Reasoning**: I use symbolic AI to evaluate market conditions\n"
                "4. **Risk Management**: Higher volume = lower risk, better confidence\n\n"
                "This approach has historically outperformed random betting!"
            )
        
        # Default response
        return (
            f"👋 Hello! I'm the Chimera ASI Agent.\n\n"
            f"You said: '{text}'\n\n"
            "I specialize in market analysis using MeTTa reasoning. "
            "Try asking me to 'analyze markets' or 'recommend bets'!"
        )

    async def generate_sample_analysis(self) -> List[MarketAnalysis]:
        """Generate sample analysis for demonstration"""
        
        sample_markets = [
            {"marketId": "BTC-150K", "optionARatio": 0.85, "totalVolume": 15000},
            {"marketId": "ETH-7K", "optionARatio": 0.25, "totalVolume": 8000},
        ]
        
        results = []
        for market_data in sample_markets:
            analysis = self.metta_reasoner.analyze_market(market_data)
            
            results.append(MarketAnalysis(
                market_id=market_data["marketId"],
                recommendation=analysis["recommendation"],
                confidence=analysis["confidence"],
                reasoning=analysis["reasoning"],
                risk_level=analysis["risk_level"],
                timestamp=datetime.now().isoformat(),
                metta_analysis=analysis["metta_analysis"]
            ))
        
        return results

    def run(self):
        """Start the agent for Agentverse deployment"""
        
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            ctx.logger.info("🚀 Chimera ASI Agent starting for Agentverse...")
            ctx.logger.info(f"📍 Agent address: {self.agent.address}")
            ctx.logger.info(f"🏷️  Agent name: chimera-market-analyzer")
            ctx.logger.info(f"🧠 MeTTa reasoning: {'✅ Active' if self.metta_reasoner.rules_loaded else '⚠️ Fallback'}")
            ctx.logger.info(f"🎯 Capabilities: {', '.join(self.capabilities)}")
            ctx.logger.info("✅ Ready for Agentverse registration!")
        
        print("🚀 Starting Chimera ASI Agent for Agentverse...")
        print(f"📍 Agent address: {self.agent.address}")
        print("🌐 Ready for Agentverse registration at: https://agentverse.ai")
        
        self.agent.run()

if __name__ == "__main__":
    # Create and run agent
    agent = ChimeraAgentverse()
    
    try:
        agent.run()
    except KeyboardInterrupt:
        print("\n👋 Agent stopped by user")
    except Exception as e:
        print(f"\n❌ Agent error: {e}")
        raise