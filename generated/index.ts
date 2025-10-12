
// Generated types for ChimeraProtocol Envio indexer
export interface Market {
  id: string;
  marketId: bigint;
  title: string;
  creator: string;
  marketType: number;
  status: number;
  resolved: boolean;
  outcome?: number;
  finalPrice?: bigint;
  totalPool: bigint;
  totalOptionAShares: bigint;
  totalOptionBShares: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  resolvedAt?: bigint;
}

export interface UserPosition {
  id: string;
  marketId: bigint;
  user: string;
  optionAShares: bigint;
  optionBShares: bigint;
  totalInvested: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface AgentDelegation {
  id: string;
  user: string;
  agent: string;
  approved: boolean;
  maxBetAmount: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface PriceUpdate {
  id: string;
  priceId: string;
  price: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
}

// Event interfaces
export interface MarketCreatedEvent {
  id: string;
  marketId: bigint;
  title: string;
  creator: string;
  marketType: number;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface BetPlacedEvent {
  id: string;
  marketId: bigint;
  user: string;
  agent: string;
  option: number;
  amount: bigint;
  shares: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface MarketResolvedEvent {
  id: string;
  marketId: bigint;
  outcome: number;
  resolver: string;
  finalPrice: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface AgentDelegationUpdatedEvent {
  id: string;
  user: string;
  agent: string;
  approved: boolean;
  maxBetAmount: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface PythPriceUpdatedEvent {
  id: string;
  priceId: string;
  price: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

// Mock ChimeraProtocol object for compatibility
export const ChimeraProtocol = {
  MarketCreated: {
    handler: (fn: any) => fn
  },
  BetPlaced: {
    handler: (fn: any) => fn
  },
  MarketResolved: {
    handler: (fn: any) => fn
  },
  AgentDelegationUpdated: {
    handler: (fn: any) => fn
  },
  PythPriceUpdated: {
    handler: (fn: any) => fn
  }
};
