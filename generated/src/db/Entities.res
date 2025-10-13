open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let name: string
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

exception UnexpectedIdNotDefinedOnEntity
let getEntityIdUnsafe = (entity: 'entity): id =>
  switch Utils.magic(entity)["id"] {
  | Some(id) => id
  | None =>
    UnexpectedIdNotDefinedOnEntity->ErrorHandling.mkLogAndRaise(
      ~msg="Property 'id' does not exist on expected entity object",
    )
  }

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>
}

module AgentDelegation = {
  let name = (AgentDelegation :> string)
  @genType
  type t = {
    agent: string,
    approved: bool,
    createdAt: bigint,
    id: id,
    maxBetAmount: bigint,
    updatedAt: bigint,
    user: string,
  }

  let schema = S.object((s): t => {
    agent: s.field("agent", S.string),
    approved: s.field("approved", S.bool),
    createdAt: s.field("createdAt", BigInt.schema),
    id: s.field("id", S.string),
    maxBetAmount: s.field("maxBetAmount", BigInt.schema),
    updatedAt: s.field("updatedAt", BigInt.schema),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "agent", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "approved", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "maxBetAmount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module AgentDelegationUpdatedEvent = {
  let name = (AgentDelegationUpdatedEvent :> string)
  @genType
  type t = {
    agent: string,
    approved: bool,
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    maxBetAmount: bigint,
    transactionHash: string,
    user: string,
  }

  let schema = S.object((s): t => {
    agent: s.field("agent", S.string),
    approved: s.field("approved", S.bool),
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    maxBetAmount: s.field("maxBetAmount", BigInt.schema),
    transactionHash: s.field("transactionHash", S.string),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "agent", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "approved", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "maxBetAmount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module BetPlacedEvent = {
  let name = (BetPlacedEvent :> string)
  @genType
  type t = {
    agent: string,
    amount: bigint,
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    market_id: id,
    marketId: bigint,
    option: int,
    shares: bigint,
    transactionHash: string,
    user: string,
  }

  let schema = S.object((s): t => {
    agent: s.field("agent", S.string),
    amount: s.field("amount", BigInt.schema),
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    market_id: s.field("market_id", S.string),
    marketId: s.field("marketId", BigInt.schema),
    option: s.field("option", S.int),
    shares: s.field("shares", BigInt.schema),
    transactionHash: s.field("transactionHash", S.string),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
      @as("market_id") market_id: whereOperations<t, id>,
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "agent", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "market", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      ~linkedEntity="Market",
      ),
      mkField(
      "marketId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "option", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "shares", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module Market = {
  let name = (Market :> string)
  @genType
  type t = {
    
    createdAt: bigint,
    creator: string,
    finalPrice: option<bigint>,
    id: id,
    marketId: bigint,
    marketType: int,
    outcome: option<int>,
    
    resolved: bool,
    resolvedAt: option<bigint>,
    status: int,
    title: string,
    totalOptionAShares: bigint,
    totalOptionBShares: bigint,
    totalPool: bigint,
    updatedAt: bigint,
  }

  let schema = S.object((s): t => {
    
    createdAt: s.field("createdAt", BigInt.schema),
    creator: s.field("creator", S.string),
    finalPrice: s.field("finalPrice", S.null(BigInt.schema)),
    id: s.field("id", S.string),
    marketId: s.field("marketId", BigInt.schema),
    marketType: s.field("marketType", S.int),
    outcome: s.field("outcome", S.null(S.int)),
    
    resolved: s.field("resolved", S.bool),
    resolvedAt: s.field("resolvedAt", S.null(BigInt.schema)),
    status: s.field("status", S.int),
    title: s.field("title", S.string),
    totalOptionAShares: s.field("totalOptionAShares", BigInt.schema),
    totalOptionBShares: s.field("totalOptionBShares", BigInt.schema),
    totalPool: s.field("totalPool", BigInt.schema),
    updatedAt: s.field("updatedAt", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "creator", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "finalPrice", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "marketId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "marketType", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "outcome", 
      Integer,
      ~fieldSchema=S.null(S.int),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "resolved", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "resolvedAt", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "status", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "title", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "totalOptionAShares", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalOptionBShares", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalPool", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkDerivedFromField(
      "bets", 
      ~derivedFromEntity="BetPlacedEvent",
      ~derivedFromField="market",
      ),
      mkDerivedFromField(
      "positions", 
      ~derivedFromEntity="UserPosition",
      ~derivedFromField="market",
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module MarketCreatedEvent = {
  let name = (MarketCreatedEvent :> string)
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    creator: string,
    id: id,
    marketId: bigint,
    marketType: int,
    title: string,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    creator: s.field("creator", S.string),
    id: s.field("id", S.string),
    marketId: s.field("marketId", BigInt.schema),
    marketType: s.field("marketType", S.int),
    title: s.field("title", S.string),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "creator", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "marketId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "marketType", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "title", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module MarketResolvedEvent = {
  let name = (MarketResolvedEvent :> string)
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    finalPrice: bigint,
    id: id,
    marketId: bigint,
    outcome: int,
    resolver: string,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    finalPrice: s.field("finalPrice", BigInt.schema),
    id: s.field("id", S.string),
    marketId: s.field("marketId", BigInt.schema),
    outcome: s.field("outcome", S.int),
    resolver: s.field("resolver", S.string),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "finalPrice", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "marketId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "outcome", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "resolver", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module PriceUpdate = {
  let name = (PriceUpdate :> string)
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    price: bigint,
    priceId: string,
    timestamp: bigint,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    price: s.field("price", BigInt.schema),
    priceId: s.field("priceId", S.string),
    timestamp: s.field("timestamp", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "price", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "priceId", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module PythPriceUpdatedEvent = {
  let name = (PythPriceUpdatedEvent :> string)
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    price: bigint,
    priceId: string,
    timestamp: bigint,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    price: s.field("price", BigInt.schema),
    priceId: s.field("priceId", S.string),
    timestamp: s.field("timestamp", BigInt.schema),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "price", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "priceId", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module UserPosition = {
  let name = (UserPosition :> string)
  @genType
  type t = {
    createdAt: bigint,
    id: id,
    market_id: id,
    marketId: bigint,
    optionAShares: bigint,
    optionBShares: bigint,
    totalInvested: bigint,
    updatedAt: bigint,
    user: string,
  }

  let schema = S.object((s): t => {
    createdAt: s.field("createdAt", BigInt.schema),
    id: s.field("id", S.string),
    market_id: s.field("market_id", S.string),
    marketId: s.field("marketId", BigInt.schema),
    optionAShares: s.field("optionAShares", BigInt.schema),
    optionBShares: s.field("optionBShares", BigInt.schema),
    totalInvested: s.field("totalInvested", BigInt.schema),
    updatedAt: s.field("updatedAt", BigInt.schema),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
      @as("market_id") market_id: whereOperations<t, id>,
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "market", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      ~linkedEntity="Market",
      ),
      mkField(
      "marketId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "optionAShares", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "optionBShares", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalInvested", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(AgentDelegation),
  module(AgentDelegationUpdatedEvent),
  module(BetPlacedEvent),
  module(Market),
  module(MarketCreatedEvent),
  module(MarketResolvedEvent),
  module(PriceUpdate),
  module(PythPriceUpdatedEvent),
  module(UserPosition),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(InternalTable.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray
