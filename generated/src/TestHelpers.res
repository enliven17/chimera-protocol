/***** TAKE NOTE ******
This is a hack to get genType to work!

In order for genType to produce recursive types, it needs to be at the 
root module of a file. If it's defined in a nested module it does not 
work. So all the MockDb types and internal functions are defined in TestHelpers_MockDb
and only public functions are recreated and exported from this module.

the following module:
```rescript
module MyModule = {
  @genType
  type rec a = {fieldB: b}
  @genType and b = {fieldA: a}
}
```

produces the following in ts:
```ts
// tslint:disable-next-line:interface-over-type-literal
export type MyModule_a = { readonly fieldB: b };

// tslint:disable-next-line:interface-over-type-literal
export type MyModule_b = { readonly fieldA: MyModule_a };
```

fieldB references type b which doesn't exist because it's defined
as MyModule_b
*/

module MockDb = {
  @genType
  let createMockDb = TestHelpers_MockDb.createMockDb
}

@genType
module Addresses = {
  include TestHelpers_MockAddresses
}

module EventFunctions = {
  //Note these are made into a record to make operate in the same way
  //for Res, JS and TS.

  /**
  The arguements that get passed to a "processEvent" helper function
  */
  @genType
  type eventProcessorArgs<'event> = {
    event: 'event,
    mockDb: TestHelpers_MockDb.t,
    @deprecated("Set the chainId for the event instead")
    chainId?: int,
  }

  @genType
  type eventProcessor<'event> = eventProcessorArgs<'event> => promise<TestHelpers_MockDb.t>

  /**
  A function composer to help create individual processEvent functions
  */
  let makeEventProcessor = (~register) => args => {
    let {event, mockDb, ?chainId} =
      args->(Utils.magic: eventProcessorArgs<'event> => eventProcessorArgs<Internal.event>)

    // Have the line here, just in case the function is called with
    // a manually created event. We don't want to break the existing tests here.
    let _ =
      TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    TestHelpers_MockDb.makeProcessEvents(mockDb, ~chainId=?chainId)([event->(Utils.magic: Internal.event => Types.eventLog<unknown>)])
  }

  module MockBlock = {
    @genType
    type t = {
      hash?: string,
      number?: int,
      timestamp?: int,
    }

    let toBlock = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      number: _mock.number->Belt.Option.getWithDefault(0),
      timestamp: _mock.timestamp->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedBlock.t => Internal.eventBlock)
  }

  module MockTransaction = {
    @genType
    type t = {
      from?: option<Address.t>,
      gasPrice?: option<bigint>,
      hash?: string,
      input?: string,
      to?: option<Address.t>,
      transactionIndex?: int,
      value?: bigint,
    }

    let toTransaction = (_mock: t) => {
      from: _mock.from->Belt.Option.getWithDefault(None),
      gasPrice: _mock.gasPrice->Belt.Option.getWithDefault(None),
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      input: _mock.input->Belt.Option.getWithDefault("foo"),
      to: _mock.to->Belt.Option.getWithDefault(None),
      transactionIndex: _mock.transactionIndex->Belt.Option.getWithDefault(0),
      value: _mock.value->Belt.Option.getWithDefault(0n),
    }->(Utils.magic: Types.AggregatedTransaction.t => Internal.eventTransaction)
  }

  @genType
  type mockEventData = {
    chainId?: int,
    srcAddress?: Address.t,
    logIndex?: int,
    block?: MockBlock.t,
    transaction?: MockTransaction.t,
  }

  /**
  Applies optional paramters with defaults for all common eventLog field
  */
  let makeEventMocker = (
    ~params: Internal.eventParams,
    ~mockEventData: option<mockEventData>,
    ~register: unit => Internal.eventConfig,
  ): Internal.event => {
    let {?block, ?transaction, ?srcAddress, ?chainId, ?logIndex} =
      mockEventData->Belt.Option.getWithDefault({})
    let block = block->Belt.Option.getWithDefault({})->MockBlock.toBlock
    let transaction = transaction->Belt.Option.getWithDefault({})->MockTransaction.toTransaction
    let config = RegisterHandlers.getConfig()
    let event: Internal.event = {
      params,
      transaction,
      chainId: switch chainId {
      | Some(chainId) => chainId
      | None =>
        switch config.defaultChain {
        | Some(chainConfig) => chainConfig.id
        | None =>
          Js.Exn.raiseError(
            "No default chain Id found, please add at least 1 chain to your config.yaml",
          )
        }
      },
      block,
      srcAddress: srcAddress->Belt.Option.getWithDefault(Addresses.defaultAddress),
      logIndex: logIndex->Belt.Option.getWithDefault(0),
    }
    // Since currently it's not possible to figure out the event config from the event
    // we store a reference to the register function by event in a weak map
    let _ = TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    event
  }
}


module ChimeraProtocol = {
  module MarketCreated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ChimeraProtocol.MarketCreated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ChimeraProtocol.MarketCreated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("marketId")
      marketId?: bigint,
      @as("title")
      title?: string,
      @as("creator")
      creator?: Address.t,
      @as("marketType")
      marketType?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?marketId,
        ?title,
        ?creator,
        ?marketType,
        ?mockEventData,
      } = args

      let params = 
      {
       marketId: marketId->Belt.Option.getWithDefault(0n),
       title: title->Belt.Option.getWithDefault("foo"),
       creator: creator->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       marketType: marketType->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.ChimeraProtocol.MarketCreated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ChimeraProtocol.MarketCreated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ChimeraProtocol.MarketCreated.event)
    }
  }

  module BetPlaced = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ChimeraProtocol.BetPlaced.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ChimeraProtocol.BetPlaced.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("marketId")
      marketId?: bigint,
      @as("user")
      user?: Address.t,
      @as("agent")
      agent?: Address.t,
      @as("option")
      option?: bigint,
      @as("amount")
      amount?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?marketId,
        ?user,
        ?agent,
        ?option,
        ?amount,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       marketId: marketId->Belt.Option.getWithDefault(0n),
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       agent: agent->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       option: option->Belt.Option.getWithDefault(0n),
       amount: amount->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.ChimeraProtocol.BetPlaced.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ChimeraProtocol.BetPlaced.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ChimeraProtocol.BetPlaced.event)
    }
  }

  module MarketResolved = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ChimeraProtocol.MarketResolved.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ChimeraProtocol.MarketResolved.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("marketId")
      marketId?: bigint,
      @as("outcome")
      outcome?: bigint,
      @as("resolver")
      resolver?: Address.t,
      @as("finalPrice")
      finalPrice?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?marketId,
        ?outcome,
        ?resolver,
        ?finalPrice,
        ?mockEventData,
      } = args

      let params = 
      {
       marketId: marketId->Belt.Option.getWithDefault(0n),
       outcome: outcome->Belt.Option.getWithDefault(0n),
       resolver: resolver->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       finalPrice: finalPrice->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.ChimeraProtocol.MarketResolved.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ChimeraProtocol.MarketResolved.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ChimeraProtocol.MarketResolved.event)
    }
  }

  module AgentDelegationUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ChimeraProtocol.AgentDelegationUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ChimeraProtocol.AgentDelegationUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("agent")
      agent?: Address.t,
      @as("approved")
      approved?: bool,
      @as("maxBetAmount")
      maxBetAmount?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?agent,
        ?approved,
        ?maxBetAmount,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       agent: agent->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       approved: approved->Belt.Option.getWithDefault(false),
       maxBetAmount: maxBetAmount->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.ChimeraProtocol.AgentDelegationUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ChimeraProtocol.AgentDelegationUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ChimeraProtocol.AgentDelegationUpdated.event)
    }
  }

  module PythPriceUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ChimeraProtocol.PythPriceUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ChimeraProtocol.PythPriceUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("priceId")
      priceId?: string,
      @as("price")
      price?: bigint,
      @as("timestamp")
      timestamp?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?priceId,
        ?price,
        ?timestamp,
        ?mockEventData,
      } = args

      let params = 
      {
       priceId: priceId->Belt.Option.getWithDefault("foo"),
       price: price->Belt.Option.getWithDefault(0n),
       timestamp: timestamp->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.ChimeraProtocol.PythPriceUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ChimeraProtocol.PythPriceUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ChimeraProtocol.PythPriceUpdated.event)
    }
  }

}

