# Hedera PYUSD Bridge Project

A cross-chain bridge for transferring PYUSD tokens from Ethereum Sepolia to Hedera Testnet using a custom bridge protocol.

## 🚀 Features

- ✅ PYUSD token bridge (Ethereum Sepolia → Hedera Testnet) - **WORKING!**
- ✅ Simple and secure bridge protocol
- ✅ Wrapped PYUSD (wPYUSD) token on Hedera
- ✅ Bridge operator system
- ✅ Hedera EVM compatibility
- ✅ Tested and verified contracts
- ⏳ LayerZero OFT Adapter (waiting for Hedera support)

## 📋 Requirements

- Node.js 18+
- npm or yarn
- MetaMask (configured for Hedera testnet)
- Hedera testnet HBAR
- Ethereum Sepolia ETH

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` file:
```
PRIVATE_KEY=your_private_key_here
ETHEREUM_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🏗️ Build and Deploy

```bash
# Compile contracts
npm run compile

# Deploy to Hedera testnet
npm run deploy:hedera-bridge

# Deploy to Ethereum Sepolia
npm run deploy:ethereum-bridge
```

## 🌉 Bridge Usage

### Simple Bridge (Working! ✅)

```bash
# 1. Deploy bridge contracts
npm run deploy:ethereum-bridge  # Ethereum Sepolia
npm run deploy:hedera-bridge    # Hedera Testnet

# 2. Check your PYUSD balance
npm run check:pyusd

# 3. Execute bridge transfer (Ethereum → Hedera)
npm run bridge:simple

# 4. Process transfer on Hedera (Bridge operator)
npm run bridge:process

# 5. Check your wPYUSD balance on Hedera
npm run check:hedera
```

### LayerZero Bridge (Not yet supported)

```bash
# PYUSD transfer using LayerZero (pending Hedera support)
npm run bridge:pyusd
```

## 🧪 Testing

```bash
npm test
```

## 📁 Project Structure

```
hedera-pyusd-bridge/
├── contracts/                    # Smart contracts
│   ├── EthereumPYUSDBridge.sol  # Ethereum bridge contract
│   ├── HederaPYUSDBridge.sol    # Hedera bridge contract
│   ├── PYUSDOFTAdapter.sol      # LayerZero adapter (future)
│   └── PYUSDOFT.sol             # LayerZero OFT (future)
├── scripts/                     # Deployment and utility scripts
│   ├── deploy-ethereum-bridge.js
│   ├── deploy-hedera-bridge.js
│   ├── bridge-pyusd-simple.js
│   └── process-bridge-transfer.js
├── test/                        # Test files
├── deployments/                 # Deployment artifacts
└── docs/                        # Documentation
    └── diagrams.md
```

## 🔗 Network Information

### Hedera Testnet
- **Chain ID:** 296
- **RPC URL:** https://testnet.hashio.io/api
- **Currency:** HBAR
- **Explorer:** https://hashscan.io/testnet
- **wPYUSD Contract:** `0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4`

### Ethereum Sepolia
- **Chain ID:** 11155111
- **RPC URL:** https://ethereum-sepolia-rpc.publicnode.com
- **Currency:** ETH
- **Explorer:** https://sepolia.etherscan.io
- **PYUSD Contract:** `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

## 📊 Token Information

| Network | Token | Address | Type |
|---------|-------|---------|------|
| Ethereum Sepolia | PYUSD | `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` | Native |
| Hedera Testnet | wPYUSD | `0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4` | Wrapped |

## ⚠️ Important Notes

- PYUSD uses 6 decimals
- HBAR uses 8 decimals (tinybar) on Hedera
- Minimum gas fees apply on Hedera
- Bridge transfers require manual processing by operator
- This is a testnet implementation for demonstration purposes

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run deploy:ethereum-bridge` | Deploy Ethereum bridge |
| `npm run deploy:hedera-bridge` | Deploy Hedera bridge |
| `npm run bridge:simple` | Execute bridge transfer |
| `npm run bridge:process` | Process bridge transfer |
| `npm run check:pyusd` | Check PYUSD balance |
| `npm run check:hedera` | Check wPYUSD balance |

## 📞 Support

For questions and issues, please use GitHub Issues.

## 📄 License

MIT License
