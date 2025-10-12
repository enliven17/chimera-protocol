const { ethers } = require("hardhat");

async function main() {
  console.log("📋 wPYUSD Token Information for MetaMask");
  
  const WRAPPED_PYUSD_ADDRESS = process.env.WRAPPED_PYUSD_ADDRESS || "0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4";
  
  console.log("\n🪙 Token Details:");
  console.log("Contract Address:", WRAPPED_PYUSD_ADDRESS);
  console.log("Network: Hedera Testnet");
  console.log("Chain ID: 296");
  
  try {
    const wrappedPYUSD = await ethers.getContractAt("MockERC20", WRAPPED_PYUSD_ADDRESS);
    
    const name = await wrappedPYUSD.name();
    const symbol = await wrappedPYUSD.symbol();
    const decimals = await wrappedPYUSD.decimals();
    
    console.log("\n📊 Token Info:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals.toString());
    
    console.log("\n📱 MetaMask Import Info:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Token Contract Address:", WRAPPED_PYUSD_ADDRESS);
    console.log("Token Symbol:", symbol);
    console.log("Token Decimals:", decimals.toString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n🌐 Hedera Testnet Network Info:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Network Name: Hedera Testnet");
    console.log("RPC URL: https://testnet.hashio.io/api");
    console.log("Chain ID: 296");
    console.log("Currency Symbol: HBAR");
    console.log("Block Explorer: https://hashscan.io/testnet");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error) {
    console.error("❌ Error getting token info:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });