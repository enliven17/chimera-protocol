import {
  ChimeraProtocol,
  MarketCreatedEvent,
  BetPlacedEvent,
  MarketResolvedEvent,
  AgentDelegationUpdatedEvent,
  PythPriceUpdatedEvent,
} from "generated";

// Market entity handler
ChimeraProtocol.MarketCreated.handler(async ({ event, context }) => {
  const entity: MarketCreatedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    marketId: event.params.marketId,
    title: event.params.title,
    creator: event.params.creator,
    marketType: Number(event.params.marketType),
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.MarketCreatedEvent.set(entity);

  // Create or update Market entity
  const market = await context.Market.get(event.params.marketId.toString());
  
  if (!market) {
    context.Market.set({
      id: event.params.marketId.toString(),
      marketId: event.params.marketId,
      title: event.params.title,
      creator: event.params.creator,
      marketType: Number(event.params.marketType),
      status: 0, // Active
      resolved: false,
      outcome: undefined,
      finalPrice: undefined,
      resolvedAt: undefined,
      totalPool: BigInt(0),
      totalOptionAShares: BigInt(0),
      totalOptionBShares: BigInt(0),
      createdAt: BigInt(event.block.timestamp),
      updatedAt: BigInt(event.block.timestamp),
    });
  }
});

// Bet placement handler
ChimeraProtocol.BetPlaced.handler(async ({ event, context }) => {
  const entity: BetPlacedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    market_id: event.params.marketId.toString(),
    marketId: event.params.marketId,
    user: event.params.user,
    agent: event.params.agent,
    option: Number(event.params.option),
    amount: event.params.amount,
    shares: event.params.shares,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.BetPlacedEvent.set(entity);

  // Update Market entity
  const market = await context.Market.get(event.params.marketId.toString());
  
  if (market) {
    const updatedMarket = {
      ...market,
      totalPool: market.totalPool + event.params.amount,
      totalOptionAShares: Number(event.params.option) === 0 
        ? market.totalOptionAShares + event.params.shares 
        : market.totalOptionAShares,
      totalOptionBShares: Number(event.params.option) === 1 
        ? market.totalOptionBShares + event.params.shares 
        : market.totalOptionBShares,
      updatedAt: BigInt(event.block.timestamp),
    };

    context.Market.set(updatedMarket);
  } else {
    // Create a placeholder market if BetPlaced arrives before MarketCreated
    context.Market.set({
      id: event.params.marketId.toString(),
      marketId: event.params.marketId,
      title: "", // unknown at this moment
      creator: "0x0000000000000000000000000000000000000000",
      marketType: 0,
      status: 0,
      resolved: false,
      outcome: undefined,
      finalPrice: undefined,
      resolvedAt: undefined,
      totalPool: event.params.amount,
      totalOptionAShares: Number(event.params.option) === 0 ? event.params.shares : BigInt(0),
      totalOptionBShares: Number(event.params.option) === 1 ? event.params.shares : BigInt(0),
      createdAt: BigInt(event.block.timestamp),
      updatedAt: BigInt(event.block.timestamp),
    });
  }

  // Create or update UserPosition entity
  const positionId = `${event.params.marketId}_${event.params.user}`;
  const position = await context.UserPosition.get(positionId);

  if (position) {
    const updatedPosition = {
      ...position,
      optionAShares: Number(event.params.option) === 0 
        ? position.optionAShares + event.params.shares 
        : position.optionAShares,
      optionBShares: Number(event.params.option) === 1 
        ? position.optionBShares + event.params.shares 
        : position.optionBShares,
      totalInvested: position.totalInvested + event.params.amount,
      updatedAt: BigInt(event.block.timestamp),
    };

    context.UserPosition.set(updatedPosition);
  } else {
    context.UserPosition.set({
      id: positionId,
      market_id: event.params.marketId.toString(),
      marketId: event.params.marketId,
      user: event.params.user,
      optionAShares: Number(event.params.option) === 0 ? event.params.shares : BigInt(0),
      optionBShares: Number(event.params.option) === 1 ? event.params.shares : BigInt(0),
      totalInvested: event.params.amount,
      createdAt: BigInt(event.block.timestamp),
      updatedAt: BigInt(event.block.timestamp),
    });
  }
});

// Market resolution handler
ChimeraProtocol.MarketResolved.handler(async ({ event, context }) => {
  const entity: MarketResolvedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    marketId: event.params.marketId,
    outcome: Number(event.params.outcome),
    resolver: event.params.resolver,
    finalPrice: event.params.finalPrice,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.MarketResolvedEvent.set(entity);

  // Update Market entity
  const market = await context.Market.get(event.params.marketId.toString());
  
  if (market) {
    const updatedMarket = {
      ...market,
      status: 2, // Resolved
      resolved: true,
      outcome: Number(event.params.outcome),
      finalPrice: event.params.finalPrice,
      resolvedAt: BigInt(event.block.timestamp),
      updatedAt: BigInt(event.block.timestamp),
    };

    context.Market.set(updatedMarket);
  }
});

// Agent delegation handler
ChimeraProtocol.AgentDelegationUpdated.handler(async ({ event, context }) => {
  const entity: AgentDelegationUpdatedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    agent: event.params.agent,
    approved: event.params.approved,
    maxBetAmount: event.params.maxBetAmount,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.AgentDelegationUpdatedEvent.set(entity);

  // Create or update AgentDelegation entity
  const delegationId = `${event.params.user}_${event.params.agent}`;
  
  if (event.params.approved) {
    context.AgentDelegation.set({
      id: delegationId,
      user: event.params.user,
      agent: event.params.agent,
      approved: true,
      maxBetAmount: event.params.maxBetAmount,
      createdAt: BigInt(event.block.timestamp),
      updatedAt: BigInt(event.block.timestamp),
    });
  } else {
    // Remove delegation if revoked
    context.AgentDelegation.deleteUnsafe(delegationId);
  }
});

// Pyth price update handler
ChimeraProtocol.PythPriceUpdated.handler(async ({ event, context }) => {
  const entity: PythPriceUpdatedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    priceId: event.params.priceId,
    price: event.params.price,
    timestamp: event.params.timestamp,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.PythPriceUpdatedEvent.set(entity);

  // Create or update PriceUpdate entity
  context.PriceUpdate.set({
    id: `${event.params.priceId}_${event.params.timestamp}`,
    priceId: event.params.priceId,
    price: event.params.price,
    timestamp: event.params.timestamp,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
  });
});