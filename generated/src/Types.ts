// This file is to dynamically generate TS types
// which we can't get using GenType
// Use @genType.import to link the types back to ReScript code

import type { Logger, EffectCaller } from "envio";
import type * as Entities from "./db/Entities.gen.ts";

export type LoaderContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * True when the handlers run in preload mode - in parallel for the whole batch.
   * Handlers run twice per batch of events, and the first time is the "preload" run
   * During preload entities aren't set, logs are ignored and exceptions are silently swallowed.
   * Preload mode is the best time to populate data to in-memory cache.
   * After preload the handler will run for the second time in sequential order of events.
   */
  readonly isPreload: boolean;
  readonly AgentDelegation: {
    /**
     * Load the entity AgentDelegation from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AgentDelegation_t | undefined>,
    /**
     * Load the entity AgentDelegation from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AgentDelegation_t>,
    readonly getWhere: Entities.AgentDelegation_indexedFieldOperations,
    /**
     * Returns the entity AgentDelegation from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AgentDelegation_t) => Promise<Entities.AgentDelegation_t>,
    /**
     * Set the entity AgentDelegation in the storage.
     */
    readonly set: (entity: Entities.AgentDelegation_t) => void,
    /**
     * Delete the entity AgentDelegation from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AgentDelegationUpdatedEvent: {
    /**
     * Load the entity AgentDelegationUpdatedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AgentDelegationUpdatedEvent_t | undefined>,
    /**
     * Load the entity AgentDelegationUpdatedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AgentDelegationUpdatedEvent_t>,
    readonly getWhere: Entities.AgentDelegationUpdatedEvent_indexedFieldOperations,
    /**
     * Returns the entity AgentDelegationUpdatedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AgentDelegationUpdatedEvent_t) => Promise<Entities.AgentDelegationUpdatedEvent_t>,
    /**
     * Set the entity AgentDelegationUpdatedEvent in the storage.
     */
    readonly set: (entity: Entities.AgentDelegationUpdatedEvent_t) => void,
    /**
     * Delete the entity AgentDelegationUpdatedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly BetPlacedEvent: {
    /**
     * Load the entity BetPlacedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.BetPlacedEvent_t | undefined>,
    /**
     * Load the entity BetPlacedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.BetPlacedEvent_t>,
    readonly getWhere: Entities.BetPlacedEvent_indexedFieldOperations,
    /**
     * Returns the entity BetPlacedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.BetPlacedEvent_t) => Promise<Entities.BetPlacedEvent_t>,
    /**
     * Set the entity BetPlacedEvent in the storage.
     */
    readonly set: (entity: Entities.BetPlacedEvent_t) => void,
    /**
     * Delete the entity BetPlacedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Market: {
    /**
     * Load the entity Market from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Market_t | undefined>,
    /**
     * Load the entity Market from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Market_t>,
    readonly getWhere: Entities.Market_indexedFieldOperations,
    /**
     * Returns the entity Market from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Market_t) => Promise<Entities.Market_t>,
    /**
     * Set the entity Market in the storage.
     */
    readonly set: (entity: Entities.Market_t) => void,
    /**
     * Delete the entity Market from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly MarketCreatedEvent: {
    /**
     * Load the entity MarketCreatedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MarketCreatedEvent_t | undefined>,
    /**
     * Load the entity MarketCreatedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MarketCreatedEvent_t>,
    readonly getWhere: Entities.MarketCreatedEvent_indexedFieldOperations,
    /**
     * Returns the entity MarketCreatedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MarketCreatedEvent_t) => Promise<Entities.MarketCreatedEvent_t>,
    /**
     * Set the entity MarketCreatedEvent in the storage.
     */
    readonly set: (entity: Entities.MarketCreatedEvent_t) => void,
    /**
     * Delete the entity MarketCreatedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly MarketResolvedEvent: {
    /**
     * Load the entity MarketResolvedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MarketResolvedEvent_t | undefined>,
    /**
     * Load the entity MarketResolvedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MarketResolvedEvent_t>,
    readonly getWhere: Entities.MarketResolvedEvent_indexedFieldOperations,
    /**
     * Returns the entity MarketResolvedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MarketResolvedEvent_t) => Promise<Entities.MarketResolvedEvent_t>,
    /**
     * Set the entity MarketResolvedEvent in the storage.
     */
    readonly set: (entity: Entities.MarketResolvedEvent_t) => void,
    /**
     * Delete the entity MarketResolvedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PriceUpdate: {
    /**
     * Load the entity PriceUpdate from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PriceUpdate_t | undefined>,
    /**
     * Load the entity PriceUpdate from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PriceUpdate_t>,
    readonly getWhere: Entities.PriceUpdate_indexedFieldOperations,
    /**
     * Returns the entity PriceUpdate from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PriceUpdate_t) => Promise<Entities.PriceUpdate_t>,
    /**
     * Set the entity PriceUpdate in the storage.
     */
    readonly set: (entity: Entities.PriceUpdate_t) => void,
    /**
     * Delete the entity PriceUpdate from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PythPriceUpdatedEvent: {
    /**
     * Load the entity PythPriceUpdatedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PythPriceUpdatedEvent_t | undefined>,
    /**
     * Load the entity PythPriceUpdatedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PythPriceUpdatedEvent_t>,
    readonly getWhere: Entities.PythPriceUpdatedEvent_indexedFieldOperations,
    /**
     * Returns the entity PythPriceUpdatedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PythPriceUpdatedEvent_t) => Promise<Entities.PythPriceUpdatedEvent_t>,
    /**
     * Set the entity PythPriceUpdatedEvent in the storage.
     */
    readonly set: (entity: Entities.PythPriceUpdatedEvent_t) => void,
    /**
     * Delete the entity PythPriceUpdatedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly UserPosition: {
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.UserPosition_t | undefined>,
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.UserPosition_t>,
    readonly getWhere: Entities.UserPosition_indexedFieldOperations,
    /**
     * Returns the entity UserPosition from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.UserPosition_t) => Promise<Entities.UserPosition_t>,
    /**
     * Set the entity UserPosition in the storage.
     */
    readonly set: (entity: Entities.UserPosition_t) => void,
    /**
     * Delete the entity UserPosition from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

export type HandlerContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  readonly AgentDelegation: {
    /**
     * Load the entity AgentDelegation from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AgentDelegation_t | undefined>,
    /**
     * Load the entity AgentDelegation from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AgentDelegation_t>,
    /**
     * Returns the entity AgentDelegation from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AgentDelegation_t) => Promise<Entities.AgentDelegation_t>,
    /**
     * Set the entity AgentDelegation in the storage.
     */
    readonly set: (entity: Entities.AgentDelegation_t) => void,
    /**
     * Delete the entity AgentDelegation from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AgentDelegationUpdatedEvent: {
    /**
     * Load the entity AgentDelegationUpdatedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AgentDelegationUpdatedEvent_t | undefined>,
    /**
     * Load the entity AgentDelegationUpdatedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AgentDelegationUpdatedEvent_t>,
    /**
     * Returns the entity AgentDelegationUpdatedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AgentDelegationUpdatedEvent_t) => Promise<Entities.AgentDelegationUpdatedEvent_t>,
    /**
     * Set the entity AgentDelegationUpdatedEvent in the storage.
     */
    readonly set: (entity: Entities.AgentDelegationUpdatedEvent_t) => void,
    /**
     * Delete the entity AgentDelegationUpdatedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly BetPlacedEvent: {
    /**
     * Load the entity BetPlacedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.BetPlacedEvent_t | undefined>,
    /**
     * Load the entity BetPlacedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.BetPlacedEvent_t>,
    /**
     * Returns the entity BetPlacedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.BetPlacedEvent_t) => Promise<Entities.BetPlacedEvent_t>,
    /**
     * Set the entity BetPlacedEvent in the storage.
     */
    readonly set: (entity: Entities.BetPlacedEvent_t) => void,
    /**
     * Delete the entity BetPlacedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Market: {
    /**
     * Load the entity Market from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Market_t | undefined>,
    /**
     * Load the entity Market from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Market_t>,
    /**
     * Returns the entity Market from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Market_t) => Promise<Entities.Market_t>,
    /**
     * Set the entity Market in the storage.
     */
    readonly set: (entity: Entities.Market_t) => void,
    /**
     * Delete the entity Market from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly MarketCreatedEvent: {
    /**
     * Load the entity MarketCreatedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MarketCreatedEvent_t | undefined>,
    /**
     * Load the entity MarketCreatedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MarketCreatedEvent_t>,
    /**
     * Returns the entity MarketCreatedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MarketCreatedEvent_t) => Promise<Entities.MarketCreatedEvent_t>,
    /**
     * Set the entity MarketCreatedEvent in the storage.
     */
    readonly set: (entity: Entities.MarketCreatedEvent_t) => void,
    /**
     * Delete the entity MarketCreatedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly MarketResolvedEvent: {
    /**
     * Load the entity MarketResolvedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MarketResolvedEvent_t | undefined>,
    /**
     * Load the entity MarketResolvedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MarketResolvedEvent_t>,
    /**
     * Returns the entity MarketResolvedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MarketResolvedEvent_t) => Promise<Entities.MarketResolvedEvent_t>,
    /**
     * Set the entity MarketResolvedEvent in the storage.
     */
    readonly set: (entity: Entities.MarketResolvedEvent_t) => void,
    /**
     * Delete the entity MarketResolvedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PriceUpdate: {
    /**
     * Load the entity PriceUpdate from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PriceUpdate_t | undefined>,
    /**
     * Load the entity PriceUpdate from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PriceUpdate_t>,
    /**
     * Returns the entity PriceUpdate from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PriceUpdate_t) => Promise<Entities.PriceUpdate_t>,
    /**
     * Set the entity PriceUpdate in the storage.
     */
    readonly set: (entity: Entities.PriceUpdate_t) => void,
    /**
     * Delete the entity PriceUpdate from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PythPriceUpdatedEvent: {
    /**
     * Load the entity PythPriceUpdatedEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PythPriceUpdatedEvent_t | undefined>,
    /**
     * Load the entity PythPriceUpdatedEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PythPriceUpdatedEvent_t>,
    /**
     * Returns the entity PythPriceUpdatedEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PythPriceUpdatedEvent_t) => Promise<Entities.PythPriceUpdatedEvent_t>,
    /**
     * Set the entity PythPriceUpdatedEvent in the storage.
     */
    readonly set: (entity: Entities.PythPriceUpdatedEvent_t) => void,
    /**
     * Delete the entity PythPriceUpdatedEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly UserPosition: {
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.UserPosition_t | undefined>,
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.UserPosition_t>,
    /**
     * Returns the entity UserPosition from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.UserPosition_t) => Promise<Entities.UserPosition_t>,
    /**
     * Set the entity UserPosition in the storage.
     */
    readonly set: (entity: Entities.UserPosition_t) => void,
    /**
     * Delete the entity UserPosition from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};
