const { ethers } = require("hardhat");

async function main() {
  console.log("🌉 Starting PYUSD Bridge Transfer...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Configuration
  const HEDERA_CHAIN_ID = 296;
  const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
  
  // Contract addresses (deployed addresses)
  const PYUSD_ADAPTER_ADDRESS = "0xAc0496777AF850441D6804a4C09ae10A880E0CD0";
  const RECIPIENT_ADDRESS = deployer.address; // Bridge to same address on Hedera
  const TRANSFER_AMOUNT = "10"; // 10 PYUSD
  
  if (PYUSD_ADAPTER_ADDRESS === "0x...") {
    console.log("❌ Error: PYUSD adapter address not set");
    console.log("Please set PYUSD_ADAPTER_ADDRESS in your .env file");
    process.exit(1);
  }
  
  console.log("PYUSD Adapter Address:", PYUSD_ADAPTER_ADDRESS);
  console.log("Recipient Address:", RECIPIENT_ADDRESS);
  console.log("Transfer Amount:", TRANSFER_AMOUNT, "PYUSD");
  
  // Get the PYUSDOFTAdapter contract
  const pyusdAdapter = await ethers.getContractAt("PYUSDOFTAdapter", PYUSD_ADAPTER_ADDRESS);
  
  // Check PYUSD balance
  const pyusdTokenAddress = await pyusdAdapter.getTokenAddress();
  const pyusdToken = await ethers.getContractAt("IERC20", pyusdTokenAddress);
  const balance = await pyusdToken.balanceOf(deployer.address);
  console.log("PYUSD Balance:", ethers.formatUnits(balance, 6), "PYUSD");
  
  if (balance < ethers.parseUnits(TRANSFER_AMOUNT, 6)) {
    console.log("❌ Error: Insufficient PYUSD balance");
    console.log("Required:", TRANSFER_AMOUNT, "PYUSD");
    console.log("Available:", ethers.formatUnits(balance, 6), "PYUSD");
    process.exit(1);
  }
  
  // Approve PYUSD tokens for the adapter
  console.log("\n🔐 Approving PYUSD tokens for adapter...");
  const approveTx = await pyusdToken.approve(PYUSD_ADAPTER_ADDRESS, ethers.MaxUint256);
  await approveTx.wait();
  console.log("✅ PYUSD tokens approved");
  
  // Get quote for the transfer
  console.log("\n💰 Getting transfer quote...");
  const quote = await pyusdAdapter.quoteSend({
    dstEid: HEDERA_CHAIN_ID,
    to: ethers.zeroPadValue(RECIPIENT_ADDRESS, 32),
    amountLD: ethers.parseUnits(TRANSFER_AMOUNT, 6),
    minAmountLD: ethers.parseUnits(TRANSFER_AMOUNT, 6),
    extraOptions: "0x",
    composeMsg: "0x",
    oftCmd: "0x"
  }, false);
  
  console.log("Transfer Quote:");
  console.log("- Native Fee:", ethers.formatEther(quote.nativeFee), "ETH");
  console.log("- LZ Token Fee:", ethers.formatUnits(quote.lzTokenFee, 6), "PYUSD");
  
  // Check ETH balance for gas
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  
  if (ethBalance < quote.nativeFee) {
    console.log("❌ Error: Insufficient ETH for gas fees");
    console.log("Required:", ethers.formatEther(quote.nativeFee), "ETH");
    console.log("Available:", ethers.formatEther(ethBalance), "ETH");
    process.exit(1);
  }
  
  // Execute the transfer
  console.log("\n🚀 Executing PYUSD transfer to Hedera...");
  const sendTx = await pyusdAdapter.send(
    {
      dstEid: HEDERA_CHAIN_ID,
      to: ethers.zeroPadValue(RECIPIENT_ADDRESS, 32),
      amountLD: ethers.parseUnits(TRANSFER_AMOUNT, 6),
      minAmountLD: ethers.parseUnits(TRANSFER_AMOUNT, 6),
      extraOptions: "0x",
      composeMsg: "0x",
      oftCmd: "0x"
    },
    {
      value: quote.nativeFee
    }
  );
  
  console.log("Transfer transaction hash:", sendTx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await sendTx.wait();
  console.log("✅ Transfer confirmed!");
  console.log("Gas used:", receipt.gasUsed.toString());
  
  // Check final balances
  const finalBalance = await pyusdToken.balanceOf(deployer.address);
  console.log("\n📊 Final PYUSD Balance:", ethers.formatUnits(finalBalance, 6), "PYUSD");
  
  console.log("\n🎉 PYUSD Bridge Transfer Completed Successfully!");
  console.log("📋 Transfer Details:");
  console.log("- From:", deployer.address);
  console.log("- To:", RECIPIENT_ADDRESS);
  console.log("- Amount:", TRANSFER_AMOUNT, "PYUSD");
  console.log("- Destination Chain: Hedera Testnet (Chain ID:", HEDERA_CHAIN_ID, ")");
  console.log("- Transaction Hash:", sendTx.hash);
  
  console.log("\n⏰ Note: The transfer will take a few minutes to complete on Hedera Testnet");
  console.log("You can check the status on HashScan: https://hashscan.io/testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Bridge transfer failed:", error);
    process.exit(1);
  });
