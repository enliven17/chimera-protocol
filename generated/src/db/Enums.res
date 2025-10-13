module ContractType = {
  @genType
  type t = 
    | @as("ChimeraProtocol") ChimeraProtocol

  let name = "CONTRACT_TYPE"
  let variants = [
    ChimeraProtocol,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("AgentDelegation") AgentDelegation
    | @as("AgentDelegationUpdatedEvent") AgentDelegationUpdatedEvent
    | @as("BetPlacedEvent") BetPlacedEvent
    | @as("Market") Market
    | @as("MarketCreatedEvent") MarketCreatedEvent
    | @as("MarketResolvedEvent") MarketResolvedEvent
    | @as("PriceUpdate") PriceUpdate
    | @as("PythPriceUpdatedEvent") PythPriceUpdatedEvent
    | @as("UserPosition") UserPosition
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    AgentDelegation,
    AgentDelegationUpdatedEvent,
    BetPlacedEvent,
    Market,
    MarketCreatedEvent,
    MarketResolvedEvent,
    PriceUpdate,
    PythPriceUpdatedEvent,
    UserPosition,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])
