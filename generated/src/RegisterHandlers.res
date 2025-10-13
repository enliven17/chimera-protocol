@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

%%private(
  let makeGeneratedConfig = () => {
    let chains = [
      {
        let contracts = [
          {
            InternalConfig.name: "ChimeraProtocol",
            abi: Types.ChimeraProtocol.abi,
            addresses: [
              "0x7Bee0AB565e6aB33009647174Eb8cd55B56EcD7c"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.ChimeraProtocol.MarketCreated.register() :> Internal.eventConfig),
              (Types.ChimeraProtocol.BetPlaced.register() :> Internal.eventConfig),
              (Types.ChimeraProtocol.MarketResolved.register() :> Internal.eventConfig),
              (Types.ChimeraProtocol.AgentDelegationUpdated.register() :> Internal.eventConfig),
              (Types.ChimeraProtocol.PythPriceUpdated.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=296)
        {
          InternalConfig.confirmedBlockThreshold: 200,
          startBlock: 8000000,
          id: 296,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "ChimeraProtocol",events: [Types.ChimeraProtocol.MarketCreated.register(), Types.ChimeraProtocol.BetPlaced.register(), Types.ChimeraProtocol.MarketResolved.register(), Types.ChimeraProtocol.AgentDelegationUpdated.register(), Types.ChimeraProtocol.PythPriceUpdated.register()],abi: Types.ChimeraProtocol.abi}], ~hyperSync=None, ~allEventSignatures=[Types.ChimeraProtocol.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "https://testnet.hashio.io/api", sourceFor: Sync, syncConfig: {}}], ~lowercaseAddresses=false)
        }
      },
    ]

    Config.make(
      ~shouldRollbackOnReorg=true,
      ~shouldSaveFullHistory=false,
      ~isUnorderedMultichainMode=false,
      ~chains,
      ~enableRawEvents=false,
      ~batchSize=?Env.batchSize,
      ~preloadHandlers=false,
      ~lowercaseAddresses=false,
      ~shouldUseHypersyncClientDecoder=true,
    )
  }

  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  let configWithoutRegistrations = makeGeneratedConfig()
  EventRegister.startRegistration(
    ~ecosystem=configWithoutRegistrations.ecosystem,
    ~multichain=configWithoutRegistrations.multichain,
    ~preloadHandlers=configWithoutRegistrations.preloadHandlers,
  )

  registerContractHandlers(
    ~contractName="ChimeraProtocol",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )

  let generatedConfig = {
    // Need to recreate initial config one more time,
    // since configWithoutRegistrations called register for event
    // before they were ready
    ...makeGeneratedConfig(),
    registrations: Some(EventRegister.finishRegistration()),
  }
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}

let getConfigWithoutRegistrations = makeGeneratedConfig
