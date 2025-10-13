  @genType
module ChimeraProtocol = {
  module MarketCreated = Types.MakeRegister(Types.ChimeraProtocol.MarketCreated)
  module BetPlaced = Types.MakeRegister(Types.ChimeraProtocol.BetPlaced)
  module MarketResolved = Types.MakeRegister(Types.ChimeraProtocol.MarketResolved)
  module AgentDelegationUpdated = Types.MakeRegister(Types.ChimeraProtocol.AgentDelegationUpdated)
  module PythPriceUpdated = Types.MakeRegister(Types.ChimeraProtocol.PythPriceUpdated)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic
