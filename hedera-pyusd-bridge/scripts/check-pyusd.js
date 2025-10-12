const { ethers } = require("hardhat");

async function checkPYUSD() {
  console.log("🔍 Checking PYUSD Token on Ethereum Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // PYUSD token address on Ethereum Sepolia
  const PYUSD_TOKEN_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  
  try {
    // Try to get basic token info
    const pyusdToken = await ethers.getContractAt("IERC20", PYUSD_TOKEN_ADDRESS);
    
    console.log("\n📋 PYUSD Token Info:");
    console.log("Name:", await pyusdToken.name());
    console.log("Symbol:", await pyusdToken.symbol());
    console.log("Decimals:", await pyusdToken.decimals());
    
    const totalSupply = await pyusdToken.totalSupply();
    console.log("Total Supply:", ethers.formatUnits(totalSupply, 6), "PYUSD");
    
    const balance = await pyusdToken.balanceOf(deployer.address);
    console.log("Your Balance:", ethers.formatUnits(balance, 6), "PYUSD");
    
    if (balance > 0) {
      console.log("\n✅ PYUSD token is working correctly!");
      console.log("You have", ethers.formatUnits(balance, 6), "PYUSD tokens");
      
      // Try a small transfer
      console.log("\n🔄 Testing small transfer...");
      const testAmount = ethers.parseUnits("0.1", 6); // 0.1 PYUSD
      
      if (balance >= testAmount) {
        const testRecipient = "0x1234567890123456789012345678901234567890";
        const transferTx = await pyusdToken.transfer(testRecipient, testAmount);
        console.log("Transfer transaction hash:", transferTx.hash);
        
        const receipt = await transferTx.wait();
        console.log("✅ Transfer successful!");
        console.log("Gas used:", receipt.gasUsed.toString());
      }
    } else {
      console.log("\n⚠️  You don't have any PYUSD tokens");
      console.log("Get some from the faucet:");
      console.log("https://cloud.google.com/application/web3/faucet/ethereum/sepolia/pyusd");
    }
    
  } catch (error) {
    console.log("❌ Error accessing PYUSD token:", error.message);
    console.log("This might not be a valid ERC20 token address");
  }
}

async function main() {
  try {
    await checkPYUSD();
  } catch (error) {
    console.error("❌ Check failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
