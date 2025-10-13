/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {ChimeraProtocol_AgentDelegationUpdated_event as Types_ChimeraProtocol_AgentDelegationUpdated_event} from './Types.gen';

import type {ChimeraProtocol_BetPlaced_event as Types_ChimeraProtocol_BetPlaced_event} from './Types.gen';

import type {ChimeraProtocol_MarketCreated_event as Types_ChimeraProtocol_MarketCreated_event} from './Types.gen';

import type {ChimeraProtocol_MarketResolved_event as Types_ChimeraProtocol_MarketResolved_event} from './Types.gen';

import type {ChimeraProtocol_PythPriceUpdated_event as Types_ChimeraProtocol_PythPriceUpdated_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = {
  readonly from?: (undefined | Address_t); 
  readonly gasPrice?: (undefined | bigint); 
  readonly hash?: string; 
  readonly input?: string; 
  readonly to?: (undefined | Address_t); 
  readonly transactionIndex?: number; 
  readonly value?: bigint
};

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type ChimeraProtocol_MarketCreated_createMockArgs = {
  readonly marketId?: bigint; 
  readonly title?: string; 
  readonly creator?: Address_t; 
  readonly marketType?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type ChimeraProtocol_BetPlaced_createMockArgs = {
  readonly marketId?: bigint; 
  readonly user?: Address_t; 
  readonly agent?: Address_t; 
  readonly option?: bigint; 
  readonly amount?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type ChimeraProtocol_MarketResolved_createMockArgs = {
  readonly marketId?: bigint; 
  readonly outcome?: bigint; 
  readonly resolver?: Address_t; 
  readonly finalPrice?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type ChimeraProtocol_AgentDelegationUpdated_createMockArgs = {
  readonly user?: Address_t; 
  readonly agent?: Address_t; 
  readonly approved?: boolean; 
  readonly maxBetAmount?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type ChimeraProtocol_PythPriceUpdated_createMockArgs = {
  readonly priceId?: string; 
  readonly price?: bigint; 
  readonly timestamp?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const ChimeraProtocol_MarketCreated_processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_MarketCreated_event> = TestHelpersJS.ChimeraProtocol.MarketCreated.processEvent as any;

export const ChimeraProtocol_MarketCreated_createMockEvent: (args:ChimeraProtocol_MarketCreated_createMockArgs) => Types_ChimeraProtocol_MarketCreated_event = TestHelpersJS.ChimeraProtocol.MarketCreated.createMockEvent as any;

export const ChimeraProtocol_BetPlaced_processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_BetPlaced_event> = TestHelpersJS.ChimeraProtocol.BetPlaced.processEvent as any;

export const ChimeraProtocol_BetPlaced_createMockEvent: (args:ChimeraProtocol_BetPlaced_createMockArgs) => Types_ChimeraProtocol_BetPlaced_event = TestHelpersJS.ChimeraProtocol.BetPlaced.createMockEvent as any;

export const ChimeraProtocol_MarketResolved_processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_MarketResolved_event> = TestHelpersJS.ChimeraProtocol.MarketResolved.processEvent as any;

export const ChimeraProtocol_MarketResolved_createMockEvent: (args:ChimeraProtocol_MarketResolved_createMockArgs) => Types_ChimeraProtocol_MarketResolved_event = TestHelpersJS.ChimeraProtocol.MarketResolved.createMockEvent as any;

export const ChimeraProtocol_AgentDelegationUpdated_processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_AgentDelegationUpdated_event> = TestHelpersJS.ChimeraProtocol.AgentDelegationUpdated.processEvent as any;

export const ChimeraProtocol_AgentDelegationUpdated_createMockEvent: (args:ChimeraProtocol_AgentDelegationUpdated_createMockArgs) => Types_ChimeraProtocol_AgentDelegationUpdated_event = TestHelpersJS.ChimeraProtocol.AgentDelegationUpdated.createMockEvent as any;

export const ChimeraProtocol_PythPriceUpdated_processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_PythPriceUpdated_event> = TestHelpersJS.ChimeraProtocol.PythPriceUpdated.processEvent as any;

export const ChimeraProtocol_PythPriceUpdated_createMockEvent: (args:ChimeraProtocol_PythPriceUpdated_createMockArgs) => Types_ChimeraProtocol_PythPriceUpdated_event = TestHelpersJS.ChimeraProtocol.PythPriceUpdated.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const ChimeraProtocol: {
  MarketResolved: {
    processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_MarketResolved_event>; 
    createMockEvent: (args:ChimeraProtocol_MarketResolved_createMockArgs) => Types_ChimeraProtocol_MarketResolved_event
  }; 
  MarketCreated: {
    processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_MarketCreated_event>; 
    createMockEvent: (args:ChimeraProtocol_MarketCreated_createMockArgs) => Types_ChimeraProtocol_MarketCreated_event
  }; 
  BetPlaced: {
    processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_BetPlaced_event>; 
    createMockEvent: (args:ChimeraProtocol_BetPlaced_createMockArgs) => Types_ChimeraProtocol_BetPlaced_event
  }; 
  PythPriceUpdated: {
    processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_PythPriceUpdated_event>; 
    createMockEvent: (args:ChimeraProtocol_PythPriceUpdated_createMockArgs) => Types_ChimeraProtocol_PythPriceUpdated_event
  }; 
  AgentDelegationUpdated: {
    processEvent: EventFunctions_eventProcessor<Types_ChimeraProtocol_AgentDelegationUpdated_event>; 
    createMockEvent: (args:ChimeraProtocol_AgentDelegationUpdated_createMockArgs) => Types_ChimeraProtocol_AgentDelegationUpdated_event
  }
} = TestHelpersJS.ChimeraProtocol as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;
