const { ethers } = require("hardhat");

async function simpleTransfer() {
  console.log("🚀 Starting Simple PYUSD Transfer Test...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // PYUSD token address on Ethereum Sepolia
  const PYUSD_TOKEN_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  // Get PYUSD token contract
  const pyusdToken = await ethers.getContractAt("IERC20", PYUSD_TOKEN_ADDRESS);
  
  // Check balance
  const balance = await pyusdToken.balanceOf(deployer.address);
  console.log("PYUSD Balance:", ethers.formatUnits(balance, 6), "PYUSD");
  
  if (balance < ethers.parseUnits("1", 6)) {
    console.log("❌ Error: Insufficient PYUSD balance for test");
    console.log("Please get some PYUSD from the faucet:");
    console.log("https://cloud.google.com/application/web3/faucet/ethereum/sepolia/pyusd");
    return;
  }
  
  // Test transfer to another address (simulating Hedera address)
  const testRecipient = "0x1234567890123456789012345678901234567890";
  const transferAmount = ethers.parseUnits("1", 6); // 1 PYUSD
  
  console.log("\n🔄 Testing PYUSD transfer...");
  console.log("From:", deployer.address);
  console.log("To:", testRecipient);
  console.log("Amount: 1 PYUSD");
  
  try {
    const transferTx = await pyusdToken.transfer(testRecipient, transferAmount);
    console.log("Transfer transaction hash:", transferTx.hash);
    
    const receipt = await transferTx.wait();
    console.log("✅ Transfer successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check final balance
    const finalBalance = await pyusdToken.balanceOf(deployer.address);
    console.log("Final PYUSD Balance:", ethers.formatUnits(finalBalance, 6), "PYUSD");
    
  } catch (error) {
    console.log("❌ Transfer failed:", error.message);
  }
  
  console.log("\n📋 PYUSD Token Info:");
  console.log("Name:", await pyusdToken.name());
  console.log("Symbol:", await pyusdToken.symbol());
  console.log("Decimals:", await pyusdToken.decimals());
  console.log("Total Supply:", ethers.formatUnits(await pyusdToken.totalSupply(), 6), "PYUSD");
}

async function main() {
  try {
    await simpleTransfer();
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
