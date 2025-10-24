# ChimeraProtocol System Diagrams 📊

Technical architecture diagrams focusing on Pyth, PYUSD, and Hedera integrations.

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "User Interface"
        Web[Next.js Frontend]
        Chat[ASI Agent Chat]
        Bridge[PYUSD Bridge UI]
    end
    
    subgraph "Hedera Testnet"
        CP[ChimeraProtocol<br/>0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644]
        WPYUSD[wPYUSD Token<br/>0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4]
        PythContract[Pyth Oracle<br/>0xa2aa501b19aff244d90cc15a4cf739d2725b5729]
    end
    
    subgraph "External Services"
        PythNetwork[Pyth Network<br/>hermes.pyth.network]
        EthSepolia[Ethereum Sepolia<br/>Bridge Contract]
        ASIEngine[ASI Agent Engine<br/>localhost:8001]
    end
    
    Web --> CP
    Chat --> ASIEngine
    Bridge --> EthSepolia
    Bridge --> WPYUSD
    CP --> PythContract
    PythContract --> PythNetwork
    CP --> WPYUSD
    
    style CP fill:#4CAF50
    style WPYUSD fill:#2196F3
    style PythContract fill:#FF9800
```

## 💰 PYUSD Bridge Flow

```mermaid
sequenceDiagram
    participant User
    participant EthUI as Ethereum UI
    participant EthBridge as ETH Bridge Contract
    participant Operator as Bridge Operator
    participant HederaBridge as Hedera Bridge
    participant wPYUSD as wPYUSD Token
    participant Markets as Prediction Markets
    
    Note over User,Markets: Ethereum → Hedera Bridge Flow
    
    User->>EthUI: Connect Wallet & Enter Amount
    EthUI->>User: Show Bridge Fee (0.1%)
    User->>EthBridge: Approve PYUSD
    User->>EthBridge: bridgeToHedera(amount, hederaAddress)
    EthBridge->>EthBridge: Lock PYUSD tokens
    EthBridge->>Operator: Emit BridgeRequest event
    
    Operator->>Operator: Validate transaction
    Operator->>HederaBridge: mintFromEthereum(user, amount, txHash)
    HederaBridge->>wPYUSD: mint(user, amount)
    wPYUSD-->>User: Receive wPYUSD on Hedera
    
    User->>Markets: Use wPYUSD for betting
    
    Note over User,Markets: 2-5 minute total time
```

## 📊 Pyth Oracle Integration

```mermaid
graph TB
    subgraph "Pyth Network"
        Publishers[95+ Data Publishers]
        Hermes[Hermes API<br/>hermes.pyth.network]
        PriceFeeds[Price Feed Aggregation]
    end
    
    subgraph "ChimeraProtocol"
        Frontend[Frontend App]
        PythClient[Pyth Client]
        PythUpdater[Price Updater]
        Contract[Chimera Contract]
    end
    
    subgraph "Hedera Blockchain"
        PythContract[Pyth Contract<br/>0xa2aa501b19aff244d90cc15a4cf739d2725b5729]
        Storage[On-chain Price Storage]
    end
    
    Publishers --> PriceFeeds
    PriceFeeds --> Hermes
    
    Frontend --> PythClient
    PythClient --> Hermes
    Hermes --> PythUpdater
    PythUpdater --> PythContract
    PythContract --> Storage
    Contract --> PythContract
    
    style Hermes fill:#FF6B35
    style PythContract fill:#FF6B35
    style Contract fill:#4CAF50
```

## 🔄 Market Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: createMarket()
    Created --> Active: Market opens
    Active --> Betting: Users place bets
    Betting --> Active: Continue betting
    Active --> PriceCheck: endTime reached
    
    state PriceCheck {
        [*] --> FetchPrice: Get Pyth price
        FetchPrice --> UpdateOnChain: updatePriceFeeds()
        UpdateOnChain --> CompareTarget: Check vs target
        CompareTarget --> [*]: Price determined
    }
    
    PriceCheck --> Resolved: resolvePriceMarket()
    Resolved --> Payout: Distribute winnings
    Payout --> [*]: Market complete
    
    note right of PriceCheck
        Pyth Oracle Integration
        - Fetch from Hermes
        - Update on-chain
        - Consume price
    end note
```

## 🤖 ASI Agent Architecture

```mermaid
graph TB
    subgraph "ASI Agent Engine (localhost:8001)"
        HTTP[HTTP Server<br/>Flask]
        MeTTa[MeTTa Reasoning<br/>Symbolic AI]
        Hyperon[Hyperon Engine<br/>Logic Processing]
        KB[Knowledge Base<br/>metta_knowledge_base.metta]
    end
    
    subgraph "Data Sources"
        HederaData[Hedera Contract Data<br/>Market states & volumes]
        PythPrices[Pyth Price Feeds<br/>BTC/ETH current prices]
        Analytics[Market Analytics<br/>Ratios & trends]
    end
    
    subgraph "Frontend Integration"
        ChatUI[Chat Interface]
        NextAPI[Next.js API Routes<br/>/api/asi-agent/chat]
        Intelligence[Market Intelligence UI]
    end
    
    ChatUI --> NextAPI
    NextAPI --> HTTP
    HTTP --> MeTTa
    MeTTa --> Hyperon
    Hyperon --> KB
    
    HTTP --> HederaData
    HTTP --> PythPrices
    HTTP --> Analytics
    
    style MeTTa fill:#9C27B0
    style Hyperon fill:#673AB7
    style HTTP fill:#4CAF50
```

## 💹 Market Analysis Flow

```mermaid
flowchart TD
    Start([User Query: "analyze markets"]) --> Fetch[Fetch Market Data]
    Fetch --> GetPrices[Get Pyth Prices]
    GetPrices --> MeTTaRules[Apply MeTTa Rules]
    
    subgraph "MeTTa Reasoning"
        MeTTaRules --> ContrarianCheck{Contrarian Signal?}
        ContrarianCheck -->|>75% bias| HighSignal[High Contrarian]
        ContrarianCheck -->|65-75% bias| MedSignal[Medium Contrarian]
        ContrarianCheck -->|<65% bias| LowSignal[Low Contrarian]
    end
    
    subgraph "Risk Assessment"
        HighSignal --> VolumeCheck{Volume > 5000?}
        MedSignal --> VolumeCheck
        LowSignal --> VolumeCheck
        VolumeCheck -->|Yes| LowRisk[Low Risk]
        VolumeCheck -->|No| HighRisk[High Risk]
    end
    
    subgraph "Recommendation"
        LowRisk --> BuyRec[BUY Recommendation]
        HighRisk --> HoldRec[HOLD Recommendation]
    end
    
    BuyRec --> Response[Return Analysis]
    HoldRec --> Response
    Response --> End([Display to User])
    
    style MeTTaRules fill:#9C27B0
    style ContrarianCheck fill:#673AB7
    style Response fill:#4CAF50
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        CSP[Content Security Policy]
        HTTPS[HTTPS Encryption]
        Wallet[Wallet Integration]
    end
    
    subgraph "Smart Contract Security"
        AccessControl[Access Controls]
        Reentrancy[Reentrancy Guards]
        SafeMath[Safe Math Operations]
        Oracle[Oracle Validation]
    end
    
    subgraph "Bridge Security"
        MultiSig[Multi-signature Validation]
        RateLimit[Rate Limiting]
        Monitor[24/7 Monitoring]
        CircuitBreaker[Emergency Pause]
    end
    
    subgraph "ASI Agent Security"
        LocalExec[Local Execution]
        InputValid[Input Validation]
        NoDataShare[No External Data Sharing]
    end
    
    CSP --> AccessControl
    Wallet --> MultiSig
    Oracle --> Monitor
    LocalExec --> InputValid
    
    style AccessControl fill:#F44336
    style MultiSig fill:#F44336
    style LocalExec fill:#9C27B0
```

## 📈 Data Flow Diagram

```mermaid
graph LR
    subgraph "Price Data Flow"
        PythPub[Pyth Publishers] --> PythNet[Pyth Network]
        PythNet --> Hermes[Hermes API]
        Hermes --> Frontend[Frontend Client]
        Hermes --> Agent[ASI Agent]
        Frontend --> HederaPyth[Hedera Pyth Contract]
        HederaPyth --> Markets[Market Settlement]
    end
    
    subgraph "PYUSD Flow"
        EthPYUSD[Ethereum PYUSD] --> EthBridge[ETH Bridge]
        EthBridge --> BridgeOp[Bridge Operator]
        BridgeOp --> HederaBridge[Hedera Bridge]
        HederaBridge --> wPYUSD[wPYUSD Token]
        wPYUSD --> Betting[Market Betting]
    end
    
    subgraph "Market Data Flow"
        Betting --> ChimeraContract[Chimera Contract]
        ChimeraContract --> HederaRPC[Hedera RPC]
        HederaRPC --> Frontend
        HederaRPC --> Agent
    end
    
    style PythNet fill:#FF6B35
    style wPYUSD fill:#2196F3
    style ChimeraContract fill:#4CAF50
```

## 🎯 Integration Points

```mermaid
mindmap
  root((ChimeraProtocol))
    Hedera
      EVM Compatibility
      Hashio RPC
      HBAR Gas Fees
      Fast Finality
    PYUSD
      Stablecoin Betting
      Cross-chain Bridge
      Ethereum Integration
      1:1 Peg Maintenance
    Pyth
      Real-time Prices
      Pull-based Updates
      BTC/ETH Feeds
      Market Settlement
    ASI
      MeTTa Reasoning
      Local Agent
      Market Analysis
      Chat Interface
```

## 🔄 User Journey

```mermaid
journey
    title User Betting Journey
    section Bridge PYUSD
      Connect Wallet: 5: User
      Bridge from Ethereum: 4: User, Bridge
      Receive wPYUSD: 5: User
    section Market Analysis
      Ask ASI Agent: 5: User, ASI
      Get Recommendation: 4: ASI, MeTTa
      Review Analysis: 5: User
    section Place Bet
      Select Market: 5: User
      Choose Option: 4: User
      Confirm Transaction: 3: User, Hedera
      Receive Confirmation: 5: User
    section Market Resolution
      Wait for End Time: 3: User
      Pyth Price Update: 5: Pyth, Oracle
      Automatic Settlement: 5: Contract
      Claim Winnings: 5: User
```

## 🏆 Technology Stack

```mermaid
graph TB
    subgraph "Blockchain Layer"
        Hedera[Hedera Hashgraph<br/>EVM Compatible]
        Ethereum[Ethereum Sepolia<br/>Bridge Source]
    end
    
    subgraph "Oracle Layer"
        Pyth[Pyth Network<br/>Price Oracles]
        Hermes[Hermes API<br/>Price Distribution]
    end
    
    subgraph "Token Layer"
        PYUSD[PYUSD Token<br/>Ethereum Native]
        wPYUSD[wPYUSD Token<br/>Hedera Wrapped]
    end
    
    subgraph "AI Layer"
        ASI[ASI Alliance<br/>Agent Framework]
        MeTTa[MeTTa Language<br/>Symbolic Reasoning]
        Hyperon[Hyperon Engine<br/>Logic Processing]
    end
    
    subgraph "Application Layer"
        NextJS[Next.js 15<br/>Frontend Framework]
        TypeScript[TypeScript<br/>Type Safety]
        Ethers[Ethers.js<br/>Blockchain Interaction]
    end
    
    Hedera --> wPYUSD
    Ethereum --> PYUSD
    Pyth --> Hermes
    ASI --> MeTTa
    MeTTa --> Hyperon
    NextJS --> Ethers
    Ethers --> Hedera
    
    style Hedera fill:#4CAF50
    style Pyth fill:#FF6B35
    style PYUSD fill:#2196F3
    style ASI fill:#9C27B0
```

## 🔄 Market Settlement Process

```mermaid
sequenceDiagram
    participant Timer as Market Timer
    participant Contract as Chimera Contract
    participant Pyth as Pyth Contract
    participant Hermes as Hermes API
    participant Users as Market Participants
    
    Note over Timer,Users: Price Market Settlement
    
    Timer->>Contract: Market end time reached
    Contract->>Contract: Check if price market
    Contract->>Hermes: Fetch latest price data
    Hermes-->>Contract: Return price update data
    Contract->>Pyth: updatePriceFeeds(updateData)
    Pyth->>Pyth: Store updated prices
    Contract->>Pyth: getPrice(priceId)
    Pyth-->>Contract: Return current price
    Contract->>Contract: Compare with target price
    
    alt Price Above Target
        Contract->>Contract: Set outcome = 0 (Option A wins)
    else Price Below Target
        Contract->>Contract: Set outcome = 1 (Option B wins)
    end
    
    Contract->>Users: Distribute winnings
    Contract->>Contract: Mark market as resolved
    
    Note over Timer,Users: Automated settlement complete
```

## 🌉 PYUSD Bridge Architecture

```mermaid
graph TB
    subgraph "Ethereum Sepolia"
        EthUser[User Wallet]
        EthPYUSD[PYUSD Token<br/>Native]
        EthBridge[Bridge Contract<br/>0xE405053847153e5Eb3984C29c58fa9E5d7de9a25]
    end
    
    subgraph "Bridge Infrastructure"
        Monitor[Event Monitor<br/>24/7 Scanning]
        Validator[Transaction Validator<br/>Security Checks]
        Operator[Bridge Operator<br/>Multi-sig Wallet]
    end
    
    subgraph "Hedera Testnet"
        HederaUser[User Wallet]
        HederawPYUSD[wPYUSD Token<br/>0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4]
        HederaBridge[Bridge Contract]
        Markets[Prediction Markets<br/>0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644]
    end
    
    EthUser --> EthPYUSD
    EthPYUSD --> EthBridge
    EthBridge --> Monitor
    Monitor --> Validator
    Validator --> Operator
    Operator --> HederaBridge
    HederaBridge --> HederawPYUSD
    HederawPYUSD --> HederaUser
    HederaUser --> Markets
    
    style EthPYUSD fill:#2196F3
    style HederawPYUSD fill:#2196F3
    style Operator fill:#FF9800
```

## 🧠 ASI Agent Reasoning Flow

```mermaid
flowchart TD
    UserQuery[User Query<br/>"analyze markets"] --> HTTPServer[HTTP Server<br/>:8001]
    HTTPServer --> DataFetch[Fetch Market Data]
    
    subgraph "Data Collection"
        DataFetch --> HederaData[Hedera Contract<br/>Market states & volumes]
        DataFetch --> PythData[Pyth Prices<br/>BTC/ETH current prices]
        DataFetch --> Analytics[Calculate Ratios<br/>Option A/B percentages]
    end
    
    subgraph "MeTTa Reasoning Engine"
        Analytics --> MeTTaParser[MeTTa Parser<br/>Parse expressions]
        MeTTaParser --> RuleEngine[Rule Engine<br/>Apply logic rules]
        RuleEngine --> ContrarianLogic{Contrarian Signal<br/>Detection}
        ContrarianLogic -->|>75% bias| HighContrarian[High Contrarian<br/>Confidence: 0.8-0.9]
        ContrarianLogic -->|65-75% bias| MedContrarian[Medium Contrarian<br/>Confidence: 0.6-0.7]
        ContrarianLogic -->|<65% bias| LowContrarian[Low Contrarian<br/>Confidence: 0.4-0.5]
    end
    
    subgraph "Risk Assessment"
        HighContrarian --> VolumeCheck{Volume Analysis}
        MedContrarian --> VolumeCheck
        LowContrarian --> VolumeCheck
        VolumeCheck -->|>5000 PYUSD| LowRisk[Low Risk<br/>Recommend BUY]
        VolumeCheck -->|<1000 PYUSD| HighRisk[High Risk<br/>Recommend HOLD]
        VolumeCheck -->|1000-5000| MedRisk[Medium Risk<br/>Conditional BUY]
    end
    
    LowRisk --> Response[Generate Response<br/>JSON format]
    HighRisk --> Response
    MedRisk --> Response
    Response --> HTTPServer
    HTTPServer --> UserInterface[Return to User]
    
    style MeTTaParser fill:#9C27B0
    style RuleEngine fill:#673AB7
    style Response fill:#4CAF50
```

## 📊 Price Feed Integration

```mermaid
graph TB
    subgraph "Pyth Network Infrastructure"
        Exchanges[Crypto Exchanges<br/>Binance, Coinbase, etc.]
        TradFi[Traditional Finance<br/>Bloomberg, Reuters]
        DeFi[DeFi Protocols<br/>Uniswap, Curve]
        Publishers[95+ Publishers<br/>Aggregate & Sign]
    end
    
    subgraph "Pyth Aggregation"
        Pythd[Pythd Network<br/>Consensus & Validation]
        Hermes[Hermes API<br/>HTTP Distribution]
        Confidence[Confidence Intervals<br/>Data Quality Metrics]
    end
    
    subgraph "ChimeraProtocol Integration"
        PullMethod[Pull Method<br/>On-demand Updates]
        UpdateFees[Update Fees<br/>Pay for freshness]
        OnChainStorage[On-chain Storage<br/>Verified prices]
        Settlement[Market Settlement<br/>Automated resolution]
    end
    
    Exchanges --> Publishers
    TradFi --> Publishers
    DeFi --> Publishers
    Publishers --> Pythd
    Pythd --> Hermes
    Pythd --> Confidence
    
    Hermes --> PullMethod
    PullMethod --> UpdateFees
    UpdateFees --> OnChainStorage
    OnChainStorage --> Settlement
    
    style Publishers fill:#FF6B35
    style Hermes fill:#FF6B35
    style Settlement fill:#4CAF50
```

## 🎮 User Interaction Flow

```mermaid
graph TB
    subgraph "User Actions"
        Connect[Connect Wallet]
        Bridge[Bridge PYUSD]
        Analyze[Ask ASI Agent]
        Bet[Place Bet]
        Monitor[Monitor Position]
    end
    
    subgraph "System Response"
        WalletConn[Wallet Connected<br/>Show balances]
        BridgeConf[Bridge Confirmed<br/>wPYUSD received]
        AIResponse[AI Analysis<br/>MeTTa reasoning]
        BetConf[Bet Confirmed<br/>Position opened]
        Updates[Real-time Updates<br/>Price & status]
    end
    
    subgraph "Backend Processing"
        HederaRPC[Hedera RPC<br/>Contract calls]
        PythAPI[Pyth API<br/>Price feeds]
        ASIEngine[ASI Engine<br/>Local analysis]
        Database[State Management<br/>React Query]
    end
    
    Connect --> WalletConn
    Bridge --> BridgeConf
    Analyze --> AIResponse
    Bet --> BetConf
    Monitor --> Updates
    
    WalletConn --> HederaRPC
    BridgeConf --> HederaRPC
    AIResponse --> ASIEngine
    BetConf --> HederaRPC
    Updates --> PythAPI
    
    HederaRPC --> Database
    PythAPI --> Database
    ASIEngine --> Database
    
    style ASIEngine fill:#9C27B0
    style PythAPI fill:#FF6B35
    style HederaRPC fill:#4CAF50
```

## 🔧 Development Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        NextDev[Next.js Dev Server<br/>:3000]
        ASIDev[ASI Agent Server<br/>:8001]
        HotReload[Hot Reload<br/>Real-time updates]
    end
    
    subgraph "Testing Infrastructure"
        Hardhat[Hardhat Framework<br/>Contract testing]
        Jest[Jest Testing<br/>Frontend tests]
        Python[Python Tests<br/>Agent testing]
    end
    
    subgraph "Deployment"
        Vercel[Vercel Frontend<br/>Production hosting]
        HederaDeploy[Hedera Contracts<br/>Testnet deployment]
        AgentDeploy[Agent Deployment<br/>Local or cloud]
    end
    
    NextDev --> HotReload
    ASIDev --> HotReload
    Hardhat --> HederaDeploy
    Jest --> Vercel
    Python --> AgentDeploy
    
    style NextDev fill:#000000
    style ASIDev fill:#9C27B0
    style HederaDeploy fill:#4CAF50
```

---

**Key Technologies**: Hedera Hashgraph • Pyth Network • PYUSD • ASI Alliance • MeTTa Reasoning