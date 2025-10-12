// Network configurations for Hedera PYUSD Bridge
module.exports = {
  // Hedera Testnet Configuration
  HEDERA_TESTNET: {
    chainId: 296,
    name: "Hedera Testnet",
    rpc: "https://testnet.hashio.io/api",
    explorer: "https://hashscan.io/testnet",
    layerZeroEndpoint: "0xbD672D1562Dd32C23B563C989d8140122483631d", // Official Hedera Testnet LayerZero endpoint
    gasPrice: "510000000000", // 510 gwei (Hedera minimum)
    nativeCurrency: {
      name: "HBAR",
      symbol: "HBAR",
      decimals: 18
    }
  },
  
  // Ethereum Sepolia Configuration
  ETHEREUM_SEPOLIA: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    rpc: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
    explorer: "https://sepolia.etherscan.io",
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Ethereum Sepolia LayerZero endpoint
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  },
  
  // PYUSD Token Configuration
  PYUSD: {
    name: "PayPal USD",
    symbol: "PYUSD",
    decimals: 6,
    // You need to get the actual PYUSD address from Paxos
    addresses: {
      ethereumSepolia: process.env.PYUSD_ETHEREUM_SEPOLIA || "0x0000000000000000000000000000000000000000",
      hederaTestnet: process.env.PYUSD_HEDERA_TESTNET || "0x0000000000000000000000000000000000000000"
    }
  },
  
  // LayerZero Configuration
  LAYERZERO: {
    endpoints: {
      hederaTestnet: "0x6EDCE65403992e310A62460808c4b910D972f10f",
      ethereumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f"
    },
    chainIds: {
      hederaTestnet: 296,
      ethereumSepolia: 11155111
    }
  },
  
  // Bridge Configuration
  BRIDGE: {
    minTransferAmount: "1", // 1 PYUSD
    maxTransferAmount: "1000000", // 1M PYUSD
    gasBuffer: "1.2", // 20% gas buffer
    timeout: 300000, // 5 minutes timeout
    retryAttempts: 3
  }
};
