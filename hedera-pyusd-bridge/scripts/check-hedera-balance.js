const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Hedera wPYUSD Balance...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Wallet Address:", deployer.address);
  
  // Configuration
  const WRAPPED_PYUSD_ADDRESS = process.env.WRAPPED_PYUSD_ADDRESS || "0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4";
  const HEDERA_BRIDGE_ADDRESS = process.env.HEDERA_BRIDGE_ADDRESS || "0x3D2d821089f83e0B272Aa2B6921C13e80eEd83ED";
  
  console.log("Wrapped PYUSD Address:", WRAPPED_PYUSD_ADDRESS);
  console.log("Hedera Bridge Address:", HEDERA_BRIDGE_ADDRESS);
  
  try {
    // Get wrapped PYUSD token contract
    const wrappedPYUSD = await ethers.getContractAt("MockERC20", WRAPPED_PYUSD_ADDRESS);
    const hederaBridge = await ethers.getContractAt("HederaPYUSDBridge", HEDERA_BRIDGE_ADDRESS);
    
    // Check token info
    const name = await wrappedPYUSD.name();
    const symbol = await wrappedPYUSD.symbol();
    const decimals = await wrappedPYUSD.decimals();
    const totalSupply = await wrappedPYUSD.totalSupply();
    
    console.log("\n📋 Wrapped PYUSD Token Information:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals));
    
    // Check balances
    const userBalance = await wrappedPYUSD.balanceOf(deployer.address);
    const bridgeBalance = await wrappedPYUSD.balanceOf(HEDERA_BRIDGE_ADDRESS);
    
    console.log("\n💰 Token Balances:");
    console.log("Your wPYUSD Balance:", ethers.formatUnits(userBalance, decimals), symbol);
    console.log("Bridge wPYUSD Balance:", ethers.formatUnits(bridgeBalance, decimals), symbol);
    
    // Check HBAR balance for gas
    const hbarBalance = await ethers.provider.getBalance(deployer.address);
    console.log("Your HBAR Balance:", ethers.formatEther(hbarBalance), "HBAR");
    
    // Get bridge info
    const bridgeInfo = await hederaBridge.getBridgeInfo();
    console.log("\n📋 Bridge Information:");
    console.log("Bridge Token Address:", bridgeInfo[0]);
    console.log("Total Locked in Bridge:", ethers.formatUnits(bridgeInfo[1], decimals), symbol);
    console.log("Bridge Fee:", ethers.formatEther(bridgeInfo[2]), "HBAR");
    console.log("Bridge Active:", bridgeInfo[3]);
    
    if (userBalance > 0) {
      console.log("\n✅ Success! You have wPYUSD tokens on Hedera Testnet!");
      console.log("🎉 Bridge transfer completed successfully!");
      
      console.log("\n💡 What you can do now:");
      console.log("1. Use wPYUSD in Hedera DeFi protocols");
      console.log("2. Transfer wPYUSD to other addresses");
      console.log("3. Bridge back to Ethereum if needed");
      console.log("4. Trade wPYUSD on Hedera DEXs");
    } else {
      console.log("\n❌ No wPYUSD tokens found.");
      console.log("Make sure the bridge transfer was processed correctly.");
    }
    
    // Network info
    const network = await ethers.provider.getNetwork();
    console.log("\n🌐 Network Information:");
    console.log("Network:", network.name || "hedera-testnet");
    console.log("Chain ID:", network.chainId);
    console.log("Block Number:", await ethers.provider.getBlockNumber());
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });