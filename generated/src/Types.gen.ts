/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {AgentDelegationUpdatedEvent_t as Entities_AgentDelegationUpdatedEvent_t} from '../src/db/Entities.gen';

import type {AgentDelegation_t as Entities_AgentDelegation_t} from '../src/db/Entities.gen';

import type {BetPlacedEvent_t as Entities_BetPlacedEvent_t} from '../src/db/Entities.gen';

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {MarketCreatedEvent_t as Entities_MarketCreatedEvent_t} from '../src/db/Entities.gen';

import type {MarketResolvedEvent_t as Entities_MarketResolvedEvent_t} from '../src/db/Entities.gen';

import type {Market_t as Entities_Market_t} from '../src/db/Entities.gen';

import type {PriceUpdate_t as Entities_PriceUpdate_t} from '../src/db/Entities.gen';

import type {PythPriceUpdatedEvent_t as Entities_PythPriceUpdatedEvent_t} from '../src/db/Entities.gen';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {UserPosition_t as Entities_UserPosition_t} from '../src/db/Entities.gen';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = { readonly log: Envio_logger; readonly addChimeraProtocol: (_1:Address_t) => void };

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type agentDelegation = Entities_AgentDelegation_t;
export type AgentDelegation = agentDelegation;

export type agentDelegationUpdatedEvent = Entities_AgentDelegationUpdatedEvent_t;
export type AgentDelegationUpdatedEvent = agentDelegationUpdatedEvent;

export type betPlacedEvent = Entities_BetPlacedEvent_t;
export type BetPlacedEvent = betPlacedEvent;

export type market = Entities_Market_t;
export type Market = market;

export type marketCreatedEvent = Entities_MarketCreatedEvent_t;
export type MarketCreatedEvent = marketCreatedEvent;

export type marketResolvedEvent = Entities_MarketResolvedEvent_t;
export type MarketResolvedEvent = marketResolvedEvent;

export type priceUpdate = Entities_PriceUpdate_t;
export type PriceUpdate = priceUpdate;

export type pythPriceUpdatedEvent = Entities_PythPriceUpdatedEvent_t;
export type PythPriceUpdatedEvent = pythPriceUpdatedEvent;

export type userPosition = Entities_UserPosition_t;
export type UserPosition = userPosition;

export type eventIdentifier = {
  readonly chainId: number; 
  readonly blockTimestamp: number; 
  readonly blockNumber: number; 
  readonly logIndex: number
};

export type entityUpdateAction<entityType> = "Delete" | { TAG: "Set"; _0: entityType };

export type entityUpdate<entityType> = {
  readonly eventIdentifier: eventIdentifier; 
  readonly entityId: id; 
  readonly entityUpdateAction: entityUpdateAction<entityType>
};

export type entityValueAtStartOfBatch<entityType> = 
    "NotSet"
  | { TAG: "AlreadySet"; _0: entityType };

export type updatedValue<entityType> = {
  readonly latest: entityUpdate<entityType>; 
  readonly history: entityUpdate<entityType>[]; 
  readonly containsRollbackDiffChange: boolean
};

export type inMemoryStoreRowEntity<entityType> = 
    { TAG: "Updated"; _0: updatedValue<entityType> }
  | { TAG: "InitialReadFromDb"; _0: entityValueAtStartOfBatch<entityType> };

export type Transaction_t = {
  readonly hash: string; 
  readonly transactionIndex: number; 
  readonly from: (undefined | Address_t); 
  readonly to: (undefined | Address_t); 
  readonly value: bigint; 
  readonly gasPrice: (undefined | bigint); 
  readonly input: string
};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {
  readonly from: (undefined | Address_t); 
  readonly gasPrice: (undefined | bigint); 
  readonly hash: string; 
  readonly input: string; 
  readonly to: (undefined | Address_t); 
  readonly transactionIndex: number; 
  readonly value: bigint
};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type ChimeraProtocol_chainId = 296;

export type ChimeraProtocol_MarketCreated_eventArgs = {
  readonly marketId: bigint; 
  readonly title: string; 
  readonly creator: Address_t; 
  readonly marketType: bigint
};

export type ChimeraProtocol_MarketCreated_block = Block_t;

export type ChimeraProtocol_MarketCreated_transaction = Transaction_t;

export type ChimeraProtocol_MarketCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ChimeraProtocol_MarketCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ChimeraProtocol_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ChimeraProtocol_MarketCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ChimeraProtocol_MarketCreated_block
};

export type ChimeraProtocol_MarketCreated_loaderArgs = Internal_genericLoaderArgs<ChimeraProtocol_MarketCreated_event,loaderContext>;

export type ChimeraProtocol_MarketCreated_loader<loaderReturn> = Internal_genericLoader<ChimeraProtocol_MarketCreated_loaderArgs,loaderReturn>;

export type ChimeraProtocol_MarketCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ChimeraProtocol_MarketCreated_event,handlerContext,loaderReturn>;

export type ChimeraProtocol_MarketCreated_handler<loaderReturn> = Internal_genericHandler<ChimeraProtocol_MarketCreated_handlerArgs<loaderReturn>>;

export type ChimeraProtocol_MarketCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ChimeraProtocol_MarketCreated_event,contractRegistrations>>;

export type ChimeraProtocol_MarketCreated_eventFilter = { readonly marketId?: SingleOrMultiple_t<bigint>; readonly creator?: SingleOrMultiple_t<Address_t> };

export type ChimeraProtocol_MarketCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ChimeraProtocol_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ChimeraProtocol_MarketCreated_eventFiltersDefinition = 
    ChimeraProtocol_MarketCreated_eventFilter
  | ChimeraProtocol_MarketCreated_eventFilter[];

export type ChimeraProtocol_MarketCreated_eventFilters = 
    ChimeraProtocol_MarketCreated_eventFilter
  | ChimeraProtocol_MarketCreated_eventFilter[]
  | ((_1:ChimeraProtocol_MarketCreated_eventFiltersArgs) => ChimeraProtocol_MarketCreated_eventFiltersDefinition);

export type ChimeraProtocol_BetPlaced_eventArgs = {
  readonly marketId: bigint; 
  readonly user: Address_t; 
  readonly agent: Address_t; 
  readonly option: bigint; 
  readonly amount: bigint; 
  readonly shares: bigint
};

export type ChimeraProtocol_BetPlaced_block = Block_t;

export type ChimeraProtocol_BetPlaced_transaction = Transaction_t;

export type ChimeraProtocol_BetPlaced_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ChimeraProtocol_BetPlaced_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ChimeraProtocol_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ChimeraProtocol_BetPlaced_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ChimeraProtocol_BetPlaced_block
};

export type ChimeraProtocol_BetPlaced_loaderArgs = Internal_genericLoaderArgs<ChimeraProtocol_BetPlaced_event,loaderContext>;

export type ChimeraProtocol_BetPlaced_loader<loaderReturn> = Internal_genericLoader<ChimeraProtocol_BetPlaced_loaderArgs,loaderReturn>;

export type ChimeraProtocol_BetPlaced_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ChimeraProtocol_BetPlaced_event,handlerContext,loaderReturn>;

export type ChimeraProtocol_BetPlaced_handler<loaderReturn> = Internal_genericHandler<ChimeraProtocol_BetPlaced_handlerArgs<loaderReturn>>;

export type ChimeraProtocol_BetPlaced_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ChimeraProtocol_BetPlaced_event,contractRegistrations>>;

export type ChimeraProtocol_BetPlaced_eventFilter = {
  readonly marketId?: SingleOrMultiple_t<bigint>; 
  readonly user?: SingleOrMultiple_t<Address_t>; 
  readonly agent?: SingleOrMultiple_t<Address_t>
};

export type ChimeraProtocol_BetPlaced_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ChimeraProtocol_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ChimeraProtocol_BetPlaced_eventFiltersDefinition = 
    ChimeraProtocol_BetPlaced_eventFilter
  | ChimeraProtocol_BetPlaced_eventFilter[];

export type ChimeraProtocol_BetPlaced_eventFilters = 
    ChimeraProtocol_BetPlaced_eventFilter
  | ChimeraProtocol_BetPlaced_eventFilter[]
  | ((_1:ChimeraProtocol_BetPlaced_eventFiltersArgs) => ChimeraProtocol_BetPlaced_eventFiltersDefinition);

export type ChimeraProtocol_MarketResolved_eventArgs = {
  readonly marketId: bigint; 
  readonly outcome: bigint; 
  readonly resolver: Address_t; 
  readonly finalPrice: bigint
};

export type ChimeraProtocol_MarketResolved_block = Block_t;

export type ChimeraProtocol_MarketResolved_transaction = Transaction_t;

export type ChimeraProtocol_MarketResolved_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ChimeraProtocol_MarketResolved_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ChimeraProtocol_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ChimeraProtocol_MarketResolved_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ChimeraProtocol_MarketResolved_block
};

export type ChimeraProtocol_MarketResolved_loaderArgs = Internal_genericLoaderArgs<ChimeraProtocol_MarketResolved_event,loaderContext>;

export type ChimeraProtocol_MarketResolved_loader<loaderReturn> = Internal_genericLoader<ChimeraProtocol_MarketResolved_loaderArgs,loaderReturn>;

export type ChimeraProtocol_MarketResolved_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ChimeraProtocol_MarketResolved_event,handlerContext,loaderReturn>;

export type ChimeraProtocol_MarketResolved_handler<loaderReturn> = Internal_genericHandler<ChimeraProtocol_MarketResolved_handlerArgs<loaderReturn>>;

export type ChimeraProtocol_MarketResolved_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ChimeraProtocol_MarketResolved_event,contractRegistrations>>;

export type ChimeraProtocol_MarketResolved_eventFilter = { readonly marketId?: SingleOrMultiple_t<bigint>; readonly resolver?: SingleOrMultiple_t<Address_t> };

export type ChimeraProtocol_MarketResolved_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ChimeraProtocol_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ChimeraProtocol_MarketResolved_eventFiltersDefinition = 
    ChimeraProtocol_MarketResolved_eventFilter
  | ChimeraProtocol_MarketResolved_eventFilter[];

export type ChimeraProtocol_MarketResolved_eventFilters = 
    ChimeraProtocol_MarketResolved_eventFilter
  | ChimeraProtocol_MarketResolved_eventFilter[]
  | ((_1:ChimeraProtocol_MarketResolved_eventFiltersArgs) => ChimeraProtocol_MarketResolved_eventFiltersDefinition);

export type ChimeraProtocol_AgentDelegationUpdated_eventArgs = {
  readonly user: Address_t; 
  readonly agent: Address_t; 
  readonly approved: boolean; 
  readonly maxBetAmount: bigint
};

export type ChimeraProtocol_AgentDelegationUpdated_block = Block_t;

export type ChimeraProtocol_AgentDelegationUpdated_transaction = Transaction_t;

export type ChimeraProtocol_AgentDelegationUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ChimeraProtocol_AgentDelegationUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ChimeraProtocol_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ChimeraProtocol_AgentDelegationUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ChimeraProtocol_AgentDelegationUpdated_block
};

export type ChimeraProtocol_AgentDelegationUpdated_loaderArgs = Internal_genericLoaderArgs<ChimeraProtocol_AgentDelegationUpdated_event,loaderContext>;

export type ChimeraProtocol_AgentDelegationUpdated_loader<loaderReturn> = Internal_genericLoader<ChimeraProtocol_AgentDelegationUpdated_loaderArgs,loaderReturn>;

export type ChimeraProtocol_AgentDelegationUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ChimeraProtocol_AgentDelegationUpdated_event,handlerContext,loaderReturn>;

export type ChimeraProtocol_AgentDelegationUpdated_handler<loaderReturn> = Internal_genericHandler<ChimeraProtocol_AgentDelegationUpdated_handlerArgs<loaderReturn>>;

export type ChimeraProtocol_AgentDelegationUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ChimeraProtocol_AgentDelegationUpdated_event,contractRegistrations>>;

export type ChimeraProtocol_AgentDelegationUpdated_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t>; readonly agent?: SingleOrMultiple_t<Address_t> };

export type ChimeraProtocol_AgentDelegationUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ChimeraProtocol_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ChimeraProtocol_AgentDelegationUpdated_eventFiltersDefinition = 
    ChimeraProtocol_AgentDelegationUpdated_eventFilter
  | ChimeraProtocol_AgentDelegationUpdated_eventFilter[];

export type ChimeraProtocol_AgentDelegationUpdated_eventFilters = 
    ChimeraProtocol_AgentDelegationUpdated_eventFilter
  | ChimeraProtocol_AgentDelegationUpdated_eventFilter[]
  | ((_1:ChimeraProtocol_AgentDelegationUpdated_eventFiltersArgs) => ChimeraProtocol_AgentDelegationUpdated_eventFiltersDefinition);

export type ChimeraProtocol_PythPriceUpdated_eventArgs = {
  readonly priceId: string; 
  readonly price: bigint; 
  readonly timestamp: bigint
};

export type ChimeraProtocol_PythPriceUpdated_block = Block_t;

export type ChimeraProtocol_PythPriceUpdated_transaction = Transaction_t;

export type ChimeraProtocol_PythPriceUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ChimeraProtocol_PythPriceUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ChimeraProtocol_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ChimeraProtocol_PythPriceUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ChimeraProtocol_PythPriceUpdated_block
};

export type ChimeraProtocol_PythPriceUpdated_loaderArgs = Internal_genericLoaderArgs<ChimeraProtocol_PythPriceUpdated_event,loaderContext>;

export type ChimeraProtocol_PythPriceUpdated_loader<loaderReturn> = Internal_genericLoader<ChimeraProtocol_PythPriceUpdated_loaderArgs,loaderReturn>;

export type ChimeraProtocol_PythPriceUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ChimeraProtocol_PythPriceUpdated_event,handlerContext,loaderReturn>;

export type ChimeraProtocol_PythPriceUpdated_handler<loaderReturn> = Internal_genericHandler<ChimeraProtocol_PythPriceUpdated_handlerArgs<loaderReturn>>;

export type ChimeraProtocol_PythPriceUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ChimeraProtocol_PythPriceUpdated_event,contractRegistrations>>;

export type ChimeraProtocol_PythPriceUpdated_eventFilter = { readonly priceId?: SingleOrMultiple_t<string> };

export type ChimeraProtocol_PythPriceUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ChimeraProtocol_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ChimeraProtocol_PythPriceUpdated_eventFiltersDefinition = 
    ChimeraProtocol_PythPriceUpdated_eventFilter
  | ChimeraProtocol_PythPriceUpdated_eventFilter[];

export type ChimeraProtocol_PythPriceUpdated_eventFilters = 
    ChimeraProtocol_PythPriceUpdated_eventFilter
  | ChimeraProtocol_PythPriceUpdated_eventFilter[]
  | ((_1:ChimeraProtocol_PythPriceUpdated_eventFiltersArgs) => ChimeraProtocol_PythPriceUpdated_eventFiltersDefinition);

export type chainId = number;

export type chain = 296;
