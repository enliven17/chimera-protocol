/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type AgentDelegation_t = {
  readonly agent: string; 
  readonly approved: boolean; 
  readonly createdAt: bigint; 
  readonly id: id; 
  readonly maxBetAmount: bigint; 
  readonly updatedAt: bigint; 
  readonly user: string
};

export type AgentDelegation_indexedFieldOperations = {};

export type AgentDelegationUpdatedEvent_t = {
  readonly agent: string; 
  readonly approved: boolean; 
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly maxBetAmount: bigint; 
  readonly transactionHash: string; 
  readonly user: string
};

export type AgentDelegationUpdatedEvent_indexedFieldOperations = {};

export type BetPlacedEvent_t = {
  readonly agent: string; 
  readonly amount: bigint; 
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly market_id: id; 
  readonly marketId: bigint; 
  readonly option: number; 
  readonly shares: bigint; 
  readonly transactionHash: string; 
  readonly user: string
};

export type BetPlacedEvent_indexedFieldOperations = { readonly market_id: whereOperations<BetPlacedEvent_t,id> };

export type Market_t = {
  readonly createdAt: bigint; 
  readonly creator: string; 
  readonly finalPrice: (undefined | bigint); 
  readonly id: id; 
  readonly marketId: bigint; 
  readonly marketType: number; 
  readonly outcome: (undefined | number); 
  readonly resolved: boolean; 
  readonly resolvedAt: (undefined | bigint); 
  readonly status: number; 
  readonly title: string; 
  readonly totalOptionAShares: bigint; 
  readonly totalOptionBShares: bigint; 
  readonly totalPool: bigint; 
  readonly updatedAt: bigint
};

export type Market_indexedFieldOperations = {};

export type MarketCreatedEvent_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly creator: string; 
  readonly id: id; 
  readonly marketId: bigint; 
  readonly marketType: number; 
  readonly title: string; 
  readonly transactionHash: string
};

export type MarketCreatedEvent_indexedFieldOperations = {};

export type MarketResolvedEvent_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly finalPrice: bigint; 
  readonly id: id; 
  readonly marketId: bigint; 
  readonly outcome: number; 
  readonly resolver: string; 
  readonly transactionHash: string
};

export type MarketResolvedEvent_indexedFieldOperations = {};

export type PriceUpdate_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly price: bigint; 
  readonly priceId: string; 
  readonly timestamp: bigint
};

export type PriceUpdate_indexedFieldOperations = {};

export type PythPriceUpdatedEvent_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly price: bigint; 
  readonly priceId: string; 
  readonly timestamp: bigint; 
  readonly transactionHash: string
};

export type PythPriceUpdatedEvent_indexedFieldOperations = {};

export type UserPosition_t = {
  readonly createdAt: bigint; 
  readonly id: id; 
  readonly market_id: id; 
  readonly marketId: bigint; 
  readonly optionAShares: bigint; 
  readonly optionBShares: bigint; 
  readonly totalInvested: bigint; 
  readonly updatedAt: bigint; 
  readonly user: string
};

export type UserPosition_indexedFieldOperations = { readonly market_id: whereOperations<UserPosition_t,id> };
