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
    marketType: event.params.marketType,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
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
      marketType: event.params.marketType,
      status: 0, // Active
      resolved: false,
      totalPool: BigInt(0),
      totalOptionAShares: BigInt(0),
      totalOptionBShares: BigInt(0),
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    });
  }
});

// Bet placement handler
ChimeraProtocol.BetPlaced.handler(async ({ event, context }) => {
  const entity: BetPlacedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    marketId: event.params.marketId,
    user: event.params.user,
    agent: event.params.agent,
    option: event.params.option,
    amount: event.params.amount,
    shares: event.params.shares,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  };

  context.BetPlacedEvent.set(entity);

  // Update Market entity
  const market = await context.Market.get(event.params.marketId.toString());
  
  if (market) {
    const updatedMarket = {
      ...market,
      totalPool: market.totalPool + event.params.amount,
      totalOptionAShares: event.params.option === 0 
        ? market.totalOptionAShares + event.params.shares 
        : market.totalOptionAShares,
      totalOptionBShares: event.params.option === 1 
        ? market.totalOptionBShares + event.params.shares 
        : market.totalOptionBShares,
      updatedAt: event.block.timestamp,
    };

    context.Market.set(updatedMarket);
  }

  // Create or update UserPosition entity
  const positionId = `${event.params.marketId}_${event.params.user}`;
  const position = await context.UserPosition.get(positionId);

  if (position) {
    const updatedPosition = {
      ...position,
      optionAShares: event.params.option === 0 
        ? position.optionAShares + event.params.shares 
        : position.optionAShares,
      optionBShares: event.params.option === 1 
        ? position.optionBShares + event.params.shares 
        : position.optionBShares,
      totalInvested: position.totalInvested + event.params.amount,
      updatedAt: event.block.timestamp,
    };

    context.UserPosition.set(updatedPosition);
  } else {
    context.UserPosition.set({
      id: positionId,
      marketId: event.params.marketId,
      user: event.params.user,
      optionAShares: event.params.option === 0 ? event.params.shares : BigInt(0),
      optionBShares: event.params.option === 1 ? event.params.shares : BigInt(0),
      totalInvested: event.params.amount,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    });
  }
});

// Market resolution handler
ChimeraProtocol.MarketResolved.handler(async ({ event, context }) => {
  const entity: MarketResolvedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    marketId: event.params.marketId,
    outcome: event.params.outcome,
    resolver: event.params.resolver,
    finalPrice: event.params.finalPrice,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
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
      outcome: event.params.outcome,
      finalPrice: event.params.finalPrice,
      resolvedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
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
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
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
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    });
  } else {
    // Remove delegation if revoked
    context.AgentDelegation.delete(delegationId);
  }
});

// Pyth price update handler
ChimeraProtocol.PythPriceUpdated.handler(async ({ event, context }) => {
  const entity: PythPriceUpdatedEvent = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    priceId: event.params.priceId,
    price: event.params.price,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  };

  context.PythPriceUpdatedEvent.set(entity);

  // Create or update PriceUpdate entity
  context.PriceUpdate.set({
    id: `${event.params.priceId}_${event.params.timestamp}`,
    priceId: event.params.priceId,
    price: event.params.price,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});