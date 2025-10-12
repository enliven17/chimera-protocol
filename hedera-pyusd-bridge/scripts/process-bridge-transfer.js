const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Processing Bridge Transfer on Hedera...");
  
  // Get the deployer account (bridge operator)
  const [deployer] = await ethers.getSigners();
  console.log("Bridge Operator:", deployer.address);
  
  // Configuration
  const HEDERA_BRIDGE_ADDRESS = process.env.HEDERA_BRIDGE_ADDRESS || "0x3D2d821089f83e0B272Aa2B6921C13e80eEd83ED";
  const WRAPPED_PYUSD_ADDRESS = process.env.WRAPPED_PYUSD_ADDRESS || "0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4";
  
  // Transfer details from Ethereum (in real scenario, this would come from event monitoring)
  const USER_ADDRESS = "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123";
  const TRANSFER_AMOUNT = "40"; // 40 PYUSD
  const ETHEREUM_TX_HASH = "0x101aece5d7454e2adc684b03845aa7b9a360e2e9424e57f496ae8673dad3dbcb";
  
  console.log("Hedera Bridge Address:", HEDERA_BRIDGE_ADDRESS);
  console.log("Wrapped PYUSD Address:", WRAPPED_PYUSD_ADDRESS);
  console.log("User Address:", USER_ADDRESS);
  console.log("Transfer Amount:", TRANSFER_AMOUNT, "PYUSD");
  console.log("Source TX Hash:", ETHEREUM_TX_HASH);
  
  // Get contracts
  const hederaBridge = await ethers.getContractAt("HederaPYUSDBridge", HEDERA_BRIDGE_ADDRESS);
  const wrappedPYUSD = await ethers.getContractAt("MockERC20", WRAPPED_PYUSD_ADDRESS);
  
  // Check balances
  console.log("\n💰 Checking balances...");
  const hbarBalance = await ethers.provider.getBalance(deployer.address);
  const bridgeBalance = await wrappedPYUSD.balanceOf(HEDERA_BRIDGE_ADDRESS);
  const userBalance = await wrappedPYUSD.balanceOf(USER_ADDRESS);
  
  console.log("Operator HBAR Balance:", ethers.formatEther(hbarBalance), "HBAR");
  console.log("Bridge wPYUSD Balance:", ethers.formatUnits(bridgeBalance, 6), "wPYUSD");
  console.log("User wPYUSD Balance (before):", ethers.formatUnits(userBalance, 6), "wPYUSD");
  
  // Check if transaction is already processed
  const txHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(ETHEREUM_TX_HASH));
  const isProcessed = await hederaBridge.processedTransactions(txHashBytes32);
  
  if (isProcessed) {
    console.log("❌ Error: Transaction already processed");
    process.exit(1);
  }
  
  console.log("✅ Transaction not yet processed, proceeding...");
  
  // Get bridge info
  const bridgeInfo = await hederaBridge.getBridgeInfo();
  console.log("\n📋 Bridge Information:");
  console.log("Token Address:", bridgeInfo[0]);
  console.log("Total Locked:", ethers.formatUnits(bridgeInfo[1], 6), "wPYUSD");
  console.log("Bridge Fee:", ethers.formatEther(bridgeInfo[2]), "HBAR");
  console.log("Is Active:", bridgeInfo[3]);
  
  if (!bridgeInfo[3]) {
    console.log("❌ Error: Bridge is not active");
    process.exit(1);
  }
  
  // Check if bridge has enough liquidity
  const requiredAmount = ethers.parseUnits(TRANSFER_AMOUNT, 6);
  if (bridgeBalance < requiredAmount) {
    console.log("❌ Error: Insufficient bridge liquidity");
    console.log("Required:", TRANSFER_AMOUNT, "wPYUSD");
    console.log("Available:", ethers.formatUnits(bridgeBalance, 6), "wPYUSD");
    process.exit(1);
  }
  
  // Process the transfer (mint tokens to user)
  console.log("\n🚀 Processing bridge transfer...");
  console.log("Minting", TRANSFER_AMOUNT, "wPYUSD to user on Hedera");
  
  const mintTx = await hederaBridge.mintTokens(
    USER_ADDRESS,
    requiredAmount,
    txHashBytes32,
    {
      gasLimit: 1000000,
      gasPrice: 510000000000
    }
  );
  
  console.log("Mint transaction hash:", mintTx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await mintTx.wait();
  console.log("✅ Transfer processed successfully!");
  console.log("Gas used:", receipt.gasUsed.toString());
  
  // Parse events
  const mintEvent = receipt.logs.find(log => {
    try {
      const parsed = hederaBridge.interface.parseLog(log);
      return parsed.name === 'TokensMinted';
    } catch (e) {
      return false;
    }
  });
  
  if (mintEvent) {
    const parsed = hederaBridge.interface.parseLog(mintEvent);
    console.log("\n📋 Mint Event Details:");
    console.log("User:", parsed.args.user);
    console.log("Amount:", ethers.formatUnits(parsed.args.amount, 6), "wPYUSD");
    console.log("Source TX Hash:", parsed.args.sourceTxHash);
  }
  
  // Check final balances
  console.log("\n📊 Final Balances:");
  const finalBridgeBalance = await wrappedPYUSD.balanceOf(HEDERA_BRIDGE_ADDRESS);
  const finalUserBalance = await wrappedPYUSD.balanceOf(USER_ADDRESS);
  
  console.log("Bridge wPYUSD Balance:", ethers.formatUnits(finalBridgeBalance, 6), "wPYUSD");
  console.log("User wPYUSD Balance (after):", ethers.formatUnits(finalUserBalance, 6), "wPYUSD");
  
  console.log("\n🎉 Bridge Transfer Processing Completed!");
  console.log("📋 Processing Summary:");
  console.log("- Amount:", TRANSFER_AMOUNT, "wPYUSD minted");
  console.log("- User:", USER_ADDRESS);
  console.log("- Source Network: Ethereum Sepolia");
  console.log("- Source TX:", ETHEREUM_TX_HASH);
  console.log("- Hedera TX:", mintTx.hash);
  
  console.log("\n🔗 Monitor your transaction:");
  console.log("Hedera Testnet:", `https://hashscan.io/testnet/transaction/${mintTx.hash}`);
  
  console.log("\n✅ Bridge transfer complete! User now has wPYUSD on Hedera Testnet.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Bridge processing failed:", error);
    process.exit(1);
  });