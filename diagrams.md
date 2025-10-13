# System Diagrams

## High-Level Architecture
```mermaid
flowchart LR
  subgraph "User Layer"
    U[User]
  end

  subgraph Frontend
    FE["Next.js App"]
  end

  subgraph Agents
    AAI["ASI Agent (uAgents + MeTTa)"]
    LIT["Vincent Skill (Lit Protocol)"]
  end

  subgraph Data
    HI["Envio HyperIndex (Hosted GQL)"]
    HS["Envio HyperSync"]
    BS["Blockscout / Autoscout"]
  end

  subgraph "On-Chain (Hedera EVM)"
    CP["ChimeraProtocol.sol"]
    PY["PYUSD (wPYUSD)"]
    PO["Pyth Oracle"]
  end

  U -->|"Wallet (Wagmi/RainbowKit)"| FE
  FE -->|"Read Markets & Positions"| HI
  FE -->|"Optional: Real-time Data"| HS
  FE -->|"Tx / View"| CP
  FE -->|"Explorer Links"| BS

  AAI -->|Query| HI
  AAI -->|"Optional: Raw Data"| HS
  AAI -->|"Signals (HTTP)"| LIT

  LIT -->|"Execute Bets"| CP
  CP -->|Events| HI
  CP -->|"Price Feeds"| PO
  CP -->|"ERC20 Ops"| PY
```

## Headless Execution Sequence
```mermaid
sequenceDiagram
  autonumber
  participant AG as ASI Agent
  participant HI as Envio HyperIndex
  participant LIT as Vincent Skill
  participant CP as ChimeraProtocol (Hedera)
  participant PY as PYUSD
  participant PO as Pyth Oracle

  AG->>HI: Query active markets (GraphQL)
  HI-->>AG: Markets, pools, shares
  AG->>AG: MeTTa reasoning (Hyperon)
  AG->>LIT: POST /execute_action { place_bet }
  LIT->>CP: placeBet(marketId, option, amount)
  CP->>PY: transferFrom(user, CP, amount)
  CP-->>LIT: BetPlaced event (tx receipt)
  CP-->>HI: Emit events for indexing
  PO-->>CP: Price update (pull/oracle)
  CP-->>CP: Settle market on condition
```

## Components
- Frontend: `Next.js` app (headless optional)
- ASI Agent: uAgents + MeTTa (Hyperon) with fallback
- Vincent Skill: Lit Protocol programmable signing (execute_action)
- Envio: HyperIndex (GQL) + HyperSync
- On-Chain: `ChimeraProtocol.sol`, Pyth Oracle, PYUSD (wPYUSD)
- Observability: Blockscout/Autoscout
