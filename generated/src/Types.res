//*************
//***ENTITIES**
//*************
@genType.as("Id")
type id = string

@genType
type contractRegistrations = {
  log: Envio.logger,
  // TODO: only add contracts we've registered for the event in the config
  addChimeraProtocol: (Address.t) => unit,
}

@genType
type entityLoaderContext<'entity, 'indexedFieldOperations> = {
  get: id => promise<option<'entity>>,
  getOrThrow: (id, ~message: string=?) => promise<'entity>,
  getWhere: 'indexedFieldOperations,
  getOrCreate: ('entity) => promise<'entity>,
  set: 'entity => unit,
  deleteUnsafe: id => unit,
}

@genType.import(("./Types.ts", "LoaderContext"))
type loaderContext = {
  log: Envio.logger,
  effect: 'input 'output. (Envio.effect<'input, 'output>, 'input) => promise<'output>,
  isPreload: bool,
  @as("AgentDelegation") agentDelegation: entityLoaderContext<Entities.AgentDelegation.t, Entities.AgentDelegation.indexedFieldOperations>,
  @as("AgentDelegationUpdatedEvent") agentDelegationUpdatedEvent: entityLoaderContext<Entities.AgentDelegationUpdatedEvent.t, Entities.AgentDelegationUpdatedEvent.indexedFieldOperations>,
  @as("BetPlacedEvent") betPlacedEvent: entityLoaderContext<Entities.BetPlacedEvent.t, Entities.BetPlacedEvent.indexedFieldOperations>,
  @as("Market") market: entityLoaderContext<Entities.Market.t, Entities.Market.indexedFieldOperations>,
  @as("MarketCreatedEvent") marketCreatedEvent: entityLoaderContext<Entities.MarketCreatedEvent.t, Entities.MarketCreatedEvent.indexedFieldOperations>,
  @as("MarketResolvedEvent") marketResolvedEvent: entityLoaderContext<Entities.MarketResolvedEvent.t, Entities.MarketResolvedEvent.indexedFieldOperations>,
  @as("PriceUpdate") priceUpdate: entityLoaderContext<Entities.PriceUpdate.t, Entities.PriceUpdate.indexedFieldOperations>,
  @as("PythPriceUpdatedEvent") pythPriceUpdatedEvent: entityLoaderContext<Entities.PythPriceUpdatedEvent.t, Entities.PythPriceUpdatedEvent.indexedFieldOperations>,
  @as("UserPosition") userPosition: entityLoaderContext<Entities.UserPosition.t, Entities.UserPosition.indexedFieldOperations>,
}

@genType
type entityHandlerContext<'entity> = Internal.entityHandlerContext<'entity>

@genType.import(("./Types.ts", "HandlerContext"))
type handlerContext = {
  log: Envio.logger,
  effect: 'input 'output. (Envio.effect<'input, 'output>, 'input) => promise<'output>,
  @as("AgentDelegation") agentDelegation: entityHandlerContext<Entities.AgentDelegation.t>,
  @as("AgentDelegationUpdatedEvent") agentDelegationUpdatedEvent: entityHandlerContext<Entities.AgentDelegationUpdatedEvent.t>,
  @as("BetPlacedEvent") betPlacedEvent: entityHandlerContext<Entities.BetPlacedEvent.t>,
  @as("Market") market: entityHandlerContext<Entities.Market.t>,
  @as("MarketCreatedEvent") marketCreatedEvent: entityHandlerContext<Entities.MarketCreatedEvent.t>,
  @as("MarketResolvedEvent") marketResolvedEvent: entityHandlerContext<Entities.MarketResolvedEvent.t>,
  @as("PriceUpdate") priceUpdate: entityHandlerContext<Entities.PriceUpdate.t>,
  @as("PythPriceUpdatedEvent") pythPriceUpdatedEvent: entityHandlerContext<Entities.PythPriceUpdatedEvent.t>,
  @as("UserPosition") userPosition: entityHandlerContext<Entities.UserPosition.t>,
}

//Re-exporting types for backwards compatability
@genType.as("AgentDelegation")
type agentDelegation = Entities.AgentDelegation.t
@genType.as("AgentDelegationUpdatedEvent")
type agentDelegationUpdatedEvent = Entities.AgentDelegationUpdatedEvent.t
@genType.as("BetPlacedEvent")
type betPlacedEvent = Entities.BetPlacedEvent.t
@genType.as("Market")
type market = Entities.Market.t
@genType.as("MarketCreatedEvent")
type marketCreatedEvent = Entities.MarketCreatedEvent.t
@genType.as("MarketResolvedEvent")
type marketResolvedEvent = Entities.MarketResolvedEvent.t
@genType.as("PriceUpdate")
type priceUpdate = Entities.PriceUpdate.t
@genType.as("PythPriceUpdatedEvent")
type pythPriceUpdatedEvent = Entities.PythPriceUpdatedEvent.t
@genType.as("UserPosition")
type userPosition = Entities.UserPosition.t

type eventIdentifier = {
  chainId: int,
  blockTimestamp: int,
  blockNumber: int,
  logIndex: int,
}

type entityUpdateAction<'entityType> =
  | Set('entityType)
  | Delete

type entityUpdate<'entityType> = {
  eventIdentifier: eventIdentifier,
  entityId: id,
  entityUpdateAction: entityUpdateAction<'entityType>,
}

let mkEntityUpdate = (~eventIdentifier, ~entityId, entityUpdateAction) => {
  entityId,
  eventIdentifier,
  entityUpdateAction,
}

type entityValueAtStartOfBatch<'entityType> =
  | NotSet // The entity isn't in the DB yet
  | AlreadySet('entityType)

type updatedValue<'entityType> = {
  latest: entityUpdate<'entityType>,
  history: array<entityUpdate<'entityType>>,
  // In the event of a rollback, some entity updates may have been
  // been affected by a rollback diff. If there was no rollback diff
  // this will always be false.
  // If there was a rollback diff, this will be false in the case of a
  // new entity update (where entity affected is not present in the diff) b
  // but true if the update is related to an entity that is
  // currently present in the diff
  containsRollbackDiffChange: bool,
}

@genType
type inMemoryStoreRowEntity<'entityType> =
  | Updated(updatedValue<'entityType>)
  | InitialReadFromDb(entityValueAtStartOfBatch<'entityType>) // This means there is no change from the db.

//*************
//**CONTRACTS**
//*************

module Transaction = {
  @genType
  type t = {hash: string, transactionIndex: int, from: option<Address.t>, to: option<Address.t>, value: bigint, gasPrice: option<bigint>, input: string}

  let schema = S.object((s): t => {hash: s.field("hash", S.string), transactionIndex: s.field("transactionIndex", S.int), from: s.field("from", S.nullable(Address.schema)), to: s.field("to", S.nullable(Address.schema)), value: s.field("value", BigInt.nativeSchema), gasPrice: s.field("gasPrice", S.nullable(BigInt.nativeSchema)), input: s.field("input", S.string)})
}

module Block = {
  @genType
  type t = {number: int, timestamp: int, hash: string}

  let schema = S.object((s): t => {number: s.field("number", S.int), timestamp: s.field("timestamp", S.int), hash: s.field("hash", S.string)})

  @get
  external getNumber: Internal.eventBlock => int = "number"

  @get
  external getTimestamp: Internal.eventBlock => int = "timestamp"
 
  @get
  external getId: Internal.eventBlock => string = "hash"

  let cleanUpRawEventFieldsInPlace: Js.Json.t => () = %raw(`fields => {
    delete fields.hash
    delete fields.number
    delete fields.timestamp
  }`)
}

module AggregatedBlock = {
  @genType
  type t = {hash: string, number: int, timestamp: int}
}
module AggregatedTransaction = {
  @genType
  type t = {from: option<Address.t>, gasPrice: option<bigint>, hash: string, input: string, to: option<Address.t>, transactionIndex: int, value: bigint}
}

@genType.as("EventLog")
type eventLog<'params> = Internal.genericEvent<'params, Block.t, Transaction.t>

module SingleOrMultiple: {
  @genType.import(("./bindings/OpaqueTypes", "SingleOrMultiple"))
  type t<'a>
  let normalizeOrThrow: (t<'a>, ~nestedArrayDepth: int=?) => array<'a>
  let single: 'a => t<'a>
  let multiple: array<'a> => t<'a>
} = {
  type t<'a> = Js.Json.t

  external single: 'a => t<'a> = "%identity"
  external multiple: array<'a> => t<'a> = "%identity"
  external castMultiple: t<'a> => array<'a> = "%identity"
  external castSingle: t<'a> => 'a = "%identity"

  exception AmbiguousEmptyNestedArray

  let rec isMultiple = (t: t<'a>, ~nestedArrayDepth): bool =>
    switch t->Js.Json.decodeArray {
    | None => false
    | Some(_arr) if nestedArrayDepth == 0 => true
    | Some([]) if nestedArrayDepth > 0 =>
      AmbiguousEmptyNestedArray->ErrorHandling.mkLogAndRaise(
        ~msg="The given empty array could be interperated as a flat array (value) or nested array. Since it's ambiguous,
        please pass in a nested empty array if the intention is to provide an empty array as a value",
      )
    | Some(arr) => arr->Js.Array2.unsafe_get(0)->isMultiple(~nestedArrayDepth=nestedArrayDepth - 1)
    }

  let normalizeOrThrow = (t: t<'a>, ~nestedArrayDepth=0): array<'a> => {
    if t->isMultiple(~nestedArrayDepth) {
      t->castMultiple
    } else {
      [t->castSingle]
    }
  }
}

module HandlerTypes = {
  @genType
  type args<'eventArgs, 'context> = {
    event: eventLog<'eventArgs>,
    context: 'context,
  }

  @genType
  type contractRegisterArgs<'eventArgs> = Internal.genericContractRegisterArgs<eventLog<'eventArgs>, contractRegistrations>
  @genType
  type contractRegister<'eventArgs> = Internal.genericContractRegister<contractRegisterArgs<'eventArgs>>

  @genType
  type loaderArgs<'eventArgs> = Internal.genericLoaderArgs<eventLog<'eventArgs>, loaderContext>
  @genType
  type loader<'eventArgs, 'loaderReturn> = Internal.genericLoader<loaderArgs<'eventArgs>, 'loaderReturn>
  
  @genType
  type handlerArgs<'eventArgs, 'loaderReturn> = Internal.genericHandlerArgs<eventLog<'eventArgs>, handlerContext, 'loaderReturn>

  @genType
  type handler<'eventArgs, 'loaderReturn> = Internal.genericHandler<handlerArgs<'eventArgs, 'loaderReturn>>

  @genType
  type loaderHandler<'eventArgs, 'loaderReturn, 'eventFilters> = Internal.genericHandlerWithLoader<
    loader<'eventArgs, 'loaderReturn>,
    handler<'eventArgs, 'loaderReturn>,
    'eventFilters
  >

  @genType
  type eventConfig<'eventFilters> = Internal.eventOptions<'eventFilters>
}

module type Event = {
  type event

  let handlerRegister: EventRegister.t

  type eventFilters
}

@genType.import(("./bindings/OpaqueTypes.ts", "HandlerWithOptions"))
type fnWithEventConfig<'fn, 'eventConfig> = ('fn, ~eventConfig: 'eventConfig=?) => unit

@genType
type handlerWithOptions<'eventArgs, 'loaderReturn, 'eventFilters> = fnWithEventConfig<
  HandlerTypes.handler<'eventArgs, 'loaderReturn>,
  HandlerTypes.eventConfig<'eventFilters>,
>

@genType
type contractRegisterWithOptions<'eventArgs, 'eventFilters> = fnWithEventConfig<
  HandlerTypes.contractRegister<'eventArgs>,
  HandlerTypes.eventConfig<'eventFilters>,
>

module MakeRegister = (Event: Event) => {
  let contractRegister: fnWithEventConfig<
    Internal.genericContractRegister<
      Internal.genericContractRegisterArgs<Event.event, contractRegistrations>,
    >,
    HandlerTypes.eventConfig<Event.eventFilters>,
  > = (contractRegister, ~eventConfig=?) =>
    Event.handlerRegister->EventRegister.setContractRegister(
      contractRegister,
      ~eventOptions=eventConfig,
    )

  let handler: fnWithEventConfig<
    Internal.genericHandler<Internal.genericHandlerArgs<Event.event, handlerContext, unit>>,
    HandlerTypes.eventConfig<Event.eventFilters>,
  > = (handler, ~eventConfig=?) => {
    Event.handlerRegister->EventRegister.setHandler(args => {
      if args.context.isPreload {
        Promise.resolve()
      } else {
        handler(
          args->(
            Utils.magic: Internal.genericHandlerArgs<
              Event.event,
              Internal.handlerContext,
              'loaderReturn,
            > => Internal.genericHandlerArgs<Event.event, handlerContext, unit>
          ),
        )
      }
    }, ~eventOptions=eventConfig)
  }

  let handlerWithLoader = (
    eventConfig: Internal.genericHandlerWithLoader<
      Internal.genericLoader<Internal.genericLoaderArgs<Event.event, loaderContext>, 'loaderReturn>,
      Internal.genericHandler<
        Internal.genericHandlerArgs<Event.event, handlerContext, 'loaderReturn>,
      >,
      Event.eventFilters,
    >,
  ) => {
    Event.handlerRegister->EventRegister.setHandler(
      args => {
        let promise = eventConfig.loader(
          args->(
            Utils.magic: Internal.genericHandlerArgs<
              Event.event,
              Internal.handlerContext,
              'loaderReturn,
            > => Internal.genericLoaderArgs<Event.event, loaderContext>
          ),
        )
        if args.context.isPreload {
          promise->Promise.ignoreValue
        } else {
          promise->Promise.then(loaderReturn => {
            (args->Obj.magic)["loaderReturn"] = loaderReturn
            eventConfig.handler(
              args->(
                Utils.magic: Internal.genericHandlerArgs<
                  Event.event,
                  Internal.handlerContext,
                  'loaderReturn,
                > => Internal.genericHandlerArgs<Event.event, handlerContext, 'loaderReturn>
              ),
            )
          })
        }
      },
      ~eventOptions=switch eventConfig {
      | {wildcard: ?None, eventFilters: ?None} => None
      | _ =>
        Some({
          wildcard: ?eventConfig.wildcard,
          eventFilters: ?eventConfig.eventFilters,
          preRegisterDynamicContracts: ?eventConfig.preRegisterDynamicContracts,
        })
      },
    )
  }
}

module ChimeraProtocol = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"AgentDelegationUpdated","inputs":[{"name":"user","type":"address","indexed":true},{"name":"agent","type":"address","indexed":true},{"name":"approved","type":"bool","indexed":false},{"name":"maxBetAmount","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"BetPlaced","inputs":[{"name":"marketId","type":"uint256","indexed":true},{"name":"user","type":"address","indexed":true},{"name":"agent","type":"address","indexed":true},{"name":"option","type":"uint8","indexed":false},{"name":"amount","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"MarketCreated","inputs":[{"name":"marketId","type":"uint256","indexed":true},{"name":"title","type":"string","indexed":false},{"name":"creator","type":"address","indexed":true},{"name":"marketType","type":"uint8","indexed":false}],"anonymous":false},{"type":"event","name":"MarketResolved","inputs":[{"name":"marketId","type":"uint256","indexed":true},{"name":"outcome","type":"uint8","indexed":false},{"name":"resolver","type":"address","indexed":true},{"name":"finalPrice","type":"int64","indexed":false}],"anonymous":false},{"type":"event","name":"PythPriceUpdated","inputs":[{"name":"priceId","type":"bytes32","indexed":true},{"name":"price","type":"int64","indexed":false},{"name":"timestamp","type":"uint64","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["AgentDelegationUpdated(address indexed user, address indexed agent, bool approved, uint256 maxBetAmount)", "BetPlaced(uint256 indexed marketId, address indexed user, address indexed agent, uint8 option, uint256 amount, uint256 shares)", "MarketCreated(uint256 indexed marketId, string title, address indexed creator, uint8 marketType)", "MarketResolved(uint256 indexed marketId, uint8 outcome, address indexed resolver, int64 finalPrice)", "PythPriceUpdated(bytes32 indexed priceId, int64 price, uint64 timestamp)"]
@genType type chainId = [#296]
let contractName = "ChimeraProtocol"

module MarketCreated = {

let id = "0x06d87b89e7940705d41ad9741832374ef202320451e21252ed0a64e963891e3d_3"
let sighash = "0x06d87b89e7940705d41ad9741832374ef202320451e21252ed0a64e963891e3d"
let name = "MarketCreated"
let contractName = contractName

@genType
type eventArgs = {marketId: bigint, title: string, creator: Address.t, marketType: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {marketId: s.field("marketId", BigInt.schema), title: s.field("title", S.string), creator: s.field("creator", Address.schema), marketType: s.field("marketType", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("marketId") marketId?: SingleOrMultiple.t<bigint>, @as("creator") creator?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["marketId","creator",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("marketId")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromBigInt)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("creator")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {marketId: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, creator: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, title: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, marketType: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module BetPlaced = {

let id = "0x98e7481db8a6cc6adbae9aec2dc338aebaccd5a3682101773363c6ead7da40f6_4"
let sighash = "0x98e7481db8a6cc6adbae9aec2dc338aebaccd5a3682101773363c6ead7da40f6"
let name = "BetPlaced"
let contractName = contractName

@genType
type eventArgs = {marketId: bigint, user: Address.t, agent: Address.t, option: bigint, amount: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {marketId: s.field("marketId", BigInt.schema), user: s.field("user", Address.schema), agent: s.field("agent", Address.schema), option: s.field("option", BigInt.schema), amount: s.field("amount", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("marketId") marketId?: SingleOrMultiple.t<bigint>, @as("user") user?: SingleOrMultiple.t<Address.t>, @as("agent") agent?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["marketId","user","agent",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("marketId")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromBigInt)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic3=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("agent")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {marketId: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, user: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, agent: decodedEvent.indexed->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, option: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module MarketResolved = {

let id = "0x9442ed846035aa12e2c3f55f06fd449bd0c83d5ccf21cf4073088f85bc591eaa_3"
let sighash = "0x9442ed846035aa12e2c3f55f06fd449bd0c83d5ccf21cf4073088f85bc591eaa"
let name = "MarketResolved"
let contractName = contractName

@genType
type eventArgs = {marketId: bigint, outcome: bigint, resolver: Address.t, finalPrice: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {marketId: s.field("marketId", BigInt.schema), outcome: s.field("outcome", BigInt.schema), resolver: s.field("resolver", Address.schema), finalPrice: s.field("finalPrice", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("marketId") marketId?: SingleOrMultiple.t<bigint>, @as("resolver") resolver?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["marketId","resolver",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("marketId")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromBigInt)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("resolver")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {marketId: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, resolver: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, outcome: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, finalPrice: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module AgentDelegationUpdated = {

let id = "0x238490ca5ca45bdd60132cec7d36724ba6c0408ef9dc8bf247c83220fc443c67_3"
let sighash = "0x238490ca5ca45bdd60132cec7d36724ba6c0408ef9dc8bf247c83220fc443c67"
let name = "AgentDelegationUpdated"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, agent: Address.t, approved: bool, maxBetAmount: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), agent: s.field("agent", Address.schema), approved: s.field("approved", S.bool), maxBetAmount: s.field("maxBetAmount", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>, @as("agent") agent?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user","agent",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("agent")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, agent: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, approved: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, maxBetAmount: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module PythPriceUpdated = {

let id = "0xc3bf9d7dfaa6761ba15e7dfaf36dca723e8c71ccd8346c9871f3514d370db82f_2"
let sighash = "0xc3bf9d7dfaa6761ba15e7dfaf36dca723e8c71ccd8346c9871f3514d370db82f"
let name = "PythPriceUpdated"
let contractName = contractName

@genType
type eventArgs = {priceId: string, price: bigint, timestamp: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {priceId: s.field("priceId", S.string), price: s.field("price", BigInt.schema), timestamp: s.field("timestamp", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("priceId") priceId?: SingleOrMultiple.t<string>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["priceId",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("priceId")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.castToHexUnsafe)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {priceId: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, price: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, timestamp: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

@genType
type chainId = int

@genType
type chain = [#296]
