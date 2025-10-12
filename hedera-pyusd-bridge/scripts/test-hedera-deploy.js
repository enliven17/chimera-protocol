const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Hedera Deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  // Test simple contract deployment first
  console.log("\n📦 Testing MockERC20 deployment...");
  try {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy(
      "Test Token",
      "TEST", 
      18,
      {
        gasLimit: 3000000,
        gasPrice: 510000000000
      }
    );
    
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("✅ MockERC20 deployed to:", mockTokenAddress);
    
    // Test LayerZero endpoint
    console.log("\n🔍 Testing LayerZero endpoint...");
    const LAYERZERO_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";
    
    // Check if endpoint exists
    const code = await ethers.provider.getCode(LAYERZERO_ENDPOINT);
    if (code === "0x") {
      console.log("❌ LayerZero endpoint not found at:", LAYERZERO_ENDPOINT);
      console.log("This might be the issue with PYUSDOFT deployment");
    } else {
      console.log("✅ LayerZero endpoint exists at:", LAYERZERO_ENDPOINT);
      console.log("Code length:", code.length);
    }
    
  } catch (error) {
    console.error("❌ Test deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });