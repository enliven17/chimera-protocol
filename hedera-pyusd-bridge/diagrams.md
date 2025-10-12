# Hedera PYUSD Bridge - Architecture Diagrams

This document contains visual representations of the bridge architecture and flow using Mermaid diagrams.

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Ethereum Sepolia"
        PYUSD[PYUSD Token<br/>0xCaC524...3bB9]
        EthBridge[Ethereum Bridge<br/>0x4Ca5E0...B228]
        User1[User Wallet]
        
        User1 -->|1. Approve| PYUSD
        User1 -->|2. Lock Tokens| EthBridge
        EthBridge -->|3. Transfer| PYUSD
    end
    
    subgraph "Bridge Operator"
        Operator[Bridge Operator<br/>Monitors Events]
        Operator -->|4. Detect Lock Event| EthBridge
    end
    
    subgraph "Hedera Testnet"
        wPYUSD[wPYUSD Token<br/>0x9D5F12...0aB4]
        HederaBridge[Hedera Bridge<br/>0x3D2d82...83ED]
        User2[User Wallet]
        
        Operator -->|5. Mint wPYUSD| HederaBridge
        HederaBridge -->|6. Transfer| wPYUSD
        wPYUSD -->|7. Receive| User2
    end
    
    style PYUSD fill:#f9f,stroke:#333,stroke-width:2px
    style wPYUSD fill:#9f9,stroke:#333,stroke-width:2px
    style EthBridge fill:#bbf,stroke:#333,stroke-width:2px
    style HederaBridge fill:#bbf,stroke:#333,stroke-width:2px
```

## 🔄 Bridge Transfer Flow

```mermaid
sequenceDiagram
    participant User as User Wallet
    participant PYUSD as PYUSD Token
    participant EthBridge as Ethereum Bridge
    participant Operator as Bridge Operator
    participant HederaBridge as Hedera Bridge
    participant wPYUSD as wPYUSD Token

    Note over User, wPYUSD: Bridge Transfer: Ethereum → Hedera
    
    User->>PYUSD: 1. approve(bridge, amount)
    PYUSD-->>User: ✅ Approval confirmed
    
    User->>EthBridge: 2. lockTokensToHedera(amount, hederaAddress)
    EthBridge->>PYUSD: 3. transferFrom(user, bridge, amount)
    PYUSD-->>EthBridge: ✅ Tokens locked
    EthBridge-->>User: 🔒 TokensLocked event emitted
    
    Note over Operator: Monitor Ethereum events
    Operator->>EthBridge: 4. Query TokensLocked events
    EthBridge-->>Operator: 📋 Event details
    
    Operator->>HederaBridge: 5. mintTokens(user, amount, txHash)
    HederaBridge->>wPYUSD: 6. transfer(user, amount)
    wPYUSD-->>User: ✅ wPYUSD received
    HederaBridge-->>Operator: 🎉 TokensMinted event emitted
```

## 🔙 Reverse Bridge Flow (Hedera → Ethereum)

```mermaid
sequenceDiagram
    participant User as User Wallet
    participant wPYUSD as wPYUSD Token
    participant HederaBridge as Hedera Bridge
    participant Operator as Bridge Operator
    participant EthBridge as Ethereum Bridge
    participant PYUSD as PYUSD Token

    Note over User, PYUSD: Reverse Bridge: Hedera → Ethereum
    
    User->>wPYUSD: 1. approve(bridge, amount)
    wPYUSD-->>User: ✅ Approval confirmed
    
    User->>HederaBridge: 2. burnTokens(amount, "ethereum-sepolia", ethAddress)
    HederaBridge->>wPYUSD: 3. transferFrom(user, bridge, amount)
    wPYUSD-->>HederaBridge: ✅ Tokens burned
    HederaBridge-->>User: 🔥 TokensBurned event emitted
    
    Note over Operator: Monitor Hedera events
    Operator->>HederaBridge: 4. Query TokensBurned events
    HederaBridge-->>Operator: 📋 Event details
    
    Operator->>EthBridge: 5. unlockTokensFromHedera(user, amount, hederaTxHash)
    EthBridge->>PYUSD: 6. transfer(user, amount)
    PYUSD-->>User: ✅ PYUSD received
    EthBridge-->>Operator: 🔓 TokensUnlocked event emitted
```

## 🏛️ Contract Architecture

```mermaid
classDiagram
    class EthereumPYUSDBridge {
        +IERC20 pyusdToken
        +uint256 totalLocked
        +uint256 bridgeFee
        +bool bridgeActive
        +address bridgeOperator
        +lockTokensToHedera(amount, hederaAddress)
        +unlockTokensFromHedera(user, amount, hederaTxHash)
        +getBridgeInfo()
        +setBridgeFee(fee)
        +toggleBridge()
    }
    
    class HederaPYUSDBridge {
        +IERC20 pyusdToken
        +uint256 totalLocked
        +uint256 bridgeFee
        +bool bridgeActive
        +mapping supportedNetworks
        +lockTokens(amount, network, address)
        +unlockTokens(user, amount, sourceTxHash)
        +mintTokens(user, amount, sourceTxHash)
        +burnTokens(amount, network, address)
        +getBridgeInfo()
    }
    
    class MockERC20 {
        +string name
        +string symbol
        +uint8 decimals
        +mint(to, amount)
        +burn(from, amount)
        +transfer(to, amount)
        +approve(spender, amount)
    }
    
    EthereumPYUSDBridge --> MockERC20 : uses PYUSD
    HederaPYUSDBridge --> MockERC20 : uses wPYUSD
    
    class Ownable {
        +address owner
        +onlyOwner modifier
        +transferOwnership(newOwner)
    }
    
    class ReentrancyGuard {
        +nonReentrant modifier
    }
    
    EthereumPYUSDBridge --|> Ownable
    EthereumPYUSDBridge --|> ReentrancyGuard
    HederaPYUSDBridge --|> Ownable
    HederaPYUSDBridge --|> ReentrancyGuard
```

## 🌐 Network Topology

```mermaid
graph LR
    subgraph "Ethereum Sepolia"
        direction TB
        ES[Ethereum Sepolia<br/>Chain ID: 11155111]
        PYUSD_ETH[PYUSD Token<br/>Native PayPal USD]
        BRIDGE_ETH[Ethereum Bridge<br/>Lock/Unlock Contract]
        
        ES --- PYUSD_ETH
        ES --- BRIDGE_ETH
    end
    
    subgraph "Bridge Infrastructure"
        direction TB
        OPERATOR[Bridge Operator<br/>Event Monitor & Processor]
        EVENTS[(Event Database<br/>Transaction History)]
        
        OPERATOR --- EVENTS
    end
    
    subgraph "Hedera Testnet"
        direction TB
        HT[Hedera Testnet<br/>Chain ID: 296]
        wPYUSD_HT[wPYUSD Token<br/>Wrapped PayPal USD]
        BRIDGE_HT[Hedera Bridge<br/>Mint/Burn Contract]
        
        HT --- wPYUSD_HT
        HT --- BRIDGE_HT
    end
    
    BRIDGE_ETH -.->|Events| OPERATOR
    OPERATOR -.->|Process| BRIDGE_HT
    BRIDGE_HT -.->|Events| OPERATOR
    OPERATOR -.->|Process| BRIDGE_ETH
    
    style ES fill:#e1f5fe
    style HT fill:#f3e5f5
    style OPERATOR fill:#fff3e0
```

## 📊 Token Flow Diagram

```mermaid
sankey-beta
    Ethereum Sepolia,PYUSD Token,100
    PYUSD Token,Ethereum Bridge,50
    Ethereum Bridge,Bridge Operator,50
    Bridge Operator,Hedera Bridge,50
    Hedera Bridge,wPYUSD Token,50
    wPYUSD Token,Hedera Testnet,50
```

## 🔐 Security Model

```mermaid
graph TD
    subgraph "Security Layers"
        A[Multi-Signature Wallet] --> B[Bridge Operator]
        B --> C[Smart Contract Validation]
        C --> D[Event Verification]
        D --> E[Transaction Processing]
        
        F[ReentrancyGuard] --> C
        G[Ownable Access Control] --> C
        H[Pausable Emergency Stop] --> C
        
        I[Cross-Chain Event Monitoring] --> D
        J[Transaction Hash Verification] --> D
        K[Duplicate Prevention] --> D
    end
    
    subgraph "Risk Mitigation"
        L[Bridge Fee Collection]
        M[Liquidity Management]
        N[Emergency Withdrawal]
        O[Bridge Pause Mechanism]
    end
    
    E --> L
    E --> M
    C --> N
    C --> O
    
    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style D fill:#fff3e0
    style E fill:#e1f5fe
```

## 🚀 Deployment Flow

```mermaid
flowchart TD
    A[Start Deployment] --> B{Environment Setup}
    B -->|✅ Ready| C[Compile Contracts]
    B -->|❌ Missing| B1[Install Dependencies]
    B1 --> B
    
    C --> D[Deploy Ethereum Bridge]
    D --> E[Deploy Hedera Bridge]
    E --> F[Deploy wPYUSD Token]
    F --> G[Configure Bridge Settings]
    
    G --> H[Set Bridge Operators]
    H --> I[Fund Bridge Liquidity]
    I --> J[Enable Bridge]
    
    J --> K[Test Bridge Transfer]
    K --> L{Test Successful?}
    L -->|✅ Yes| M[Bridge Ready]
    L -->|❌ No| N[Debug & Fix]
    N --> K
    
    M --> O[Monitor Operations]
    
    style A fill:#e8f5e8
    style M fill:#c8e6c9
    style N fill:#ffcdd2
    style O fill:#e1f5fe
```

## 📈 Transaction Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initiated : User initiates bridge transfer
    
    Initiated --> Approved : User approves tokens
    Approved --> Locked : Tokens locked on source chain
    Locked --> Detected : Bridge operator detects event
    Detected --> Validated : Transaction validated
    Validated --> Processing : Processing on destination chain
    Processing --> Minted : Tokens minted/unlocked
    Minted --> Completed : Transfer completed
    Completed --> [*]
    
    Initiated --> Failed : Insufficient balance/approval
    Approved --> Failed : Lock transaction fails
    Detected --> Failed : Invalid transaction
    Validated --> Failed : Validation fails
    Processing --> Failed : Destination chain error
    
    Failed --> [*]
    
    note right of Locked : Event emitted with transfer details
    note right of Validated : Cross-chain verification
    note right of Minted : Destination tokens available
```

---

## 📝 Notes

- All diagrams represent the current testnet implementation
- Production deployment would include additional security measures
- Bridge operator currently runs manually but can be automated
- Future LayerZero integration planned when Hedera support is available