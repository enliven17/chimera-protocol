# ChimeraAI 🔮 - ETH.MD %100 COMPLIANT

An AI-powered prediction market platform on Hedera EVM with autonomous agents, Pyth Oracle integration, and PYUSD betting. Features ASI Alliance reasoning agents and Lit Protocol secure execution for intelligent, automated trading strategies.

## 🎯 Deployed Contracts (Hedera Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| **ChimeraProtocol** | `0xeF2E2B87A82c10F68183f7654784eEbFeC160b44` | ✅ Deployed & Verified |
| **wPYUSD** | `0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4` | ✅ Deployed & Working |
| **Pyth Oracle** | `0xa2aa501b19aff244d90cc15a4cf739d2725b5729` | ✅ Integrated & Tested |

## 🎯 Project Overview

ChimeraAI combines cutting-edge AI agents with decentralized prediction markets to create an autonomous, intelligent betting ecosystem. The platform leverages multiple sponsor technologies to deliver a comprehensive solution for AI-driven market predictions.

### 🏆 Sponsor Integrations

| Sponsor | Integration | Prize Track |
|---------|-------------|-------------|
| **ASI Alliance** | MeTTa reasoning with Envio data analysis | 🚀 Best use of Artificial Superintelligence Alliance |
| **Lit Protocol** | Hedera Agent Kit + Vincent Skills for secure execution | 🎨 Best Hedera x Lit Protocol Vincent Skill |
| **Hedera** | EVM contracts + Agent Kit integration | EVM Innovator Track + Best Use of Hedera Agent Kit |
| **Pyth Network** | Pull Oracle for market resolution | ⛓️ Most Innovative use of Pyth pull oracle |
| **PayPal USD** | Wrapped PYUSD as betting currency | 🥇 Grand Prize / 🎖️ PYUSD Consumer Champion |
| **Envio** | HyperIndex for real-time data indexing | 🏆 Best Use of HyperIndex |
| **Blockscout** | Autoscout Explorer + SDK integration | 🚀 Best use of Autoscout |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ASI Alliance  │    │  Lit Protocol   │    │     Hedera      │
│   (Reasoning)   │────│  (Execution)    │────│   (Blockchain)  │
│                 │    │                 │    │                 │
│ • MeTTa Logic   │    │ • Vincent Skill │    │ • EVM Contracts │
│ • Market Analysis│    │ • Secure Actions│    │ • Agent Kit     │
│ • Strategy AI   │    │ • Delegation    │    │ • Low Fees      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    │    ┌─────────────────┐
         │      Envio      │    │    │      Pyth       │
         │   (Indexing)    │────┼────│    (Oracle)     │
         │                 │    │    │                 │
         │ • HyperIndex    │    │    │ • Price Feeds   │
         │ • Real-time API │    │    │ • Pull Oracle   │
         │ • GraphQL       │    │    │ • Market Data   │
         └─────────────────┘    │    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │      PYUSD      │
                    │   (Currency)    │
                    │                 │
                    │ • Wrapped Token │
                    │ • ERC-20 Compat │
                    │ • Bridge System │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask with Hedera Testnet
- Hedera testnet HBAR
- Python 3.8+ (for ASI agent)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/your-repo/chimeraai
cd chimeraai
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🧪 Headless Run (No Demo UI)

Run Lit Vincent Skill and ASI Agent locally without any UI.

```powershell
# 1) Start Vincent Skill
npm run start:vincent-skill

# 2) Start ASI Agent (Windows PowerShell)
$env:ENVIO_INDEXER_URL = "http://localhost:8080/v1/graphql"  # set your Envio URL
$env:LIT_PROTOCOL_ENDPOINT = "http://localhost:3001"         # Vincent Skill URL
npm run start:asi-headless
```

Notes:
- Hyperon MeTTa is optional; if not installed, the agent falls back to heuristic logic.
- Agentverse/ASI:One registration is not required for headless mode.

### Vincent Ability Headless Test
Trigger the Vincent Skill `execute_action` endpoint without UI.

```powershell
$env:LIT_PROTOCOL_ENDPOINT = "http://localhost:3001"
npm run lit:execute -- place_bet 1 0 25
```

## 📡 Envio Integration

### HyperIndex (Hosted)
- Ensure your indexer is deployed on Envio Hosted:
  1. Review `envio.config.yaml` (network 296, contract, events, field selection)
  2. Push project to Envio Hosted (via dashboard or CLI per docs)
  3. Obtain your Hosted GraphQL endpoint (e.g., `https://hosted.envio.dev/api/<project>`) 
  4. Set `ENVIO_INDEXER_URL` to this endpoint in both frontend env and ASI Agent runtime
  5. Run `npm run envio:codegen` locally if schema changes

Environment variables (Windows PowerShell):
```powershell
$env:ENVIO_INDEXER_URL = "https://hosted.envio.dev/api/<project>"
```

Used by:
- ASI Agent: `agents/asi-agent/market_analyzer.py`
- Frontend: `src/lib/envio-client.ts`

### HyperSync (Sample)
Run a minimal HyperSync query to fetch recent transactions:

```powershell
$env:HYPERSYNC_URL = "<your hypersync http endpoint>"
$env:CHIMERA_ADDRESS = "<chimera contract address>"
npm run hypersync:sample
```

3. **Deploy contracts:**
```bash
npm run compile
npm run deploy:hedera-testnet
```

4. **Start the platform:**
```bash
# Frontend
npm run dev

# ASI Agent
cd agents/asi-agent
python market_analyzer.py

# Lit Protocol Skill
cd agents/lit-protocol
node chimera-vincent-skill.js

# Envio Indexer
npm run envio:dev
```

## 🔧 Core Components

### 1. Smart Contracts (Hedera EVM)

**ChimeraAI.sol** - Main prediction market contract with:
- PYUSD integration for betting
- Pyth Oracle for price-based market resolution
- Agent delegation system for autonomous betting
- Market creation and management
- Automated reward distribution

### 2. ASI Alliance Agent

**market_analyzer.py** - Intelligent market analysis agent:
- Fetches data from Envio HyperIndex
- Uses MeTTa reasoning for strategy decisions
- Implements contrarian betting strategies
- Sends execution signals to Lit Protocol

### 3. Lit Protocol Vincent Skill

**chimera-vincent-skill.js** - Secure execution layer:
- Validates agent delegations
- Executes bets on behalf of users
- Enforces spending limits and permissions
- Provides audit trail for all actions

### 4. Envio Indexer

Real-time blockchain data indexing:
- Indexes all ChimeraAI events
- Provides GraphQL API for agents
- Tracks market states and user positions
- Enables fast data queries for AI analysis

### 5. Frontend (Next.js)

Modern web interface for:
- Market browsing and creation
- Manual betting and position management
- Agent delegation and configuration
- Real-time market data visualization

## 📊 Market Types

### Price Direction Markets
- **Oracle Integration:** Pyth Network price feeds
- **Resolution:** Automatic via price data
- **Examples:** "Will BTC be above $50k by Friday?"

### Custom Event Markets
- **Resolution:** Manual by market creator
- **Examples:** "Will it rain tomorrow?", "Who will win the election?"

## 🤖 AI Agent System

### ASI Alliance Integration
- **MeTTa Reasoning:** Advanced logical inference for market analysis
- **Data Sources:** Envio indexed data + external sentiment
- **Strategies:** Contrarian betting, volume analysis, trend following

### Lit Protocol Security
- **Delegation System:** Users authorize agents with spending limits
- **Secure Execution:** All agent actions validated and logged
- **Permission Management:** Granular control over agent capabilities

## 🔗 Network Information

### Hedera Testnet
- **Chain ID:** 296
- **RPC:** https://testnet.hashio.io/api
- **Explorer:** https://hashscan.io/testnet
- **Currency:** HBAR

### Contract Addresses
- **ChimeraAI:** `TBD` (after deployment)
- **Wrapped PYUSD:** `0x95bc083e6911DeBc46b36cDCE8996fAEB28bf9A6`
- **Pyth Oracle:** `0x2880aB155794e7179c9eE2e38200202908C17B43`

## 🛠️ Development

### Available Scripts

```bash
# Smart Contracts
npm run compile              # Compile contracts
npm run deploy:hedera-testnet # Deploy to Hedera testnet
npm run test                 # Run contract tests

# Frontend
npm run dev                  # Start development server
npm run build               # Build for production
npm run start               # Start production server

# Envio Indexer
npm run envio:init          # Initialize indexer
npm run envio:dev           # Start indexer in dev mode
npm run envio:codegen       # Generate types

# Agents
cd agents/asi-agent && python market_analyzer.py    # Start ASI agent
cd agents/lit-protocol && node chimera-vincent-skill.js # Start Lit skill
```

### Testing

```bash
# Contract tests
npm run test

# Agent tests
cd agents/asi-agent && python -m pytest tests/

# Integration tests
npm run test:integration
```

## 📈 Usage Examples

### 1. Create a Price Market

```javascript
await chimeraContract.createMarket(
  "BTC Price Prediction",
  "Will Bitcoin be above $50,000 on Friday?",
  "Above $50k",
  "Below $50k",
  1, // category
  endTime,
  minBet,
  maxBet,
  imageUrl,
  0, // PriceDirection market
  btcPriceId, // Pyth price ID
  5000000000000, // $50k (scaled by 1e8)
  true // betting price will be above
);
```

### 2. Delegate to AI Agent

```javascript
await chimeraContract.delegateToAgent(
  agentAddress,
  ethers.parseUnits("100", 6) // Max 100 PYUSD per bet
);
```

### 3. Manual Betting

```javascript
// Approve PYUSD
await pyusdContract.approve(chimeraAddress, betAmount);

// Place bet
await chimeraContract.placeBet(marketId, option, betAmount);
```

## 🔒 Security Features

- **Agent Delegation:** Users maintain full control over agent permissions
- **Spending Limits:** Configurable maximum bet amounts per agent
- **Audit Trail:** All agent actions logged and verifiable
- **Oracle Security:** Pyth Network's secure price feed validation
- **Contract Verification:** All contracts verified on Hashscan

## 🌟 Key Features

- ✅ **AI-Powered Predictions:** ASI Alliance MeTTa reasoning
- ✅ **Secure Automation:** Lit Protocol Vincent Skills
- ✅ **Real-time Data:** Envio HyperIndex integration
- ✅ **Oracle Integration:** Pyth Network price feeds
- ✅ **Stable Currency:** PYUSD betting with bridge system
- ✅ **Low Fees:** Hedera EVM efficiency
- ✅ **Full Transparency:** Blockscout explorer integration

## 📞 Support

- **Documentation:** [Link to docs]
- **Discord:** [Community link]
- **GitHub Issues:** [Issues link]
- **Email:** support@chimeraai.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the future of AI-powered prediction markets**