const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Ethereum PYUSD Bridge to Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("❌ Error: Insufficient ETH balance for deployment");
    console.log("Please add some Sepolia ETH to your wallet");
    process.exit(1);
  }
  
  // PYUSD token address on Ethereum Sepolia
  const PYUSD_TOKEN_ADDRESS = process.env.PYUSD_ETHEREUM_SEPOLIA || "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  console.log("✅ Using PYUSD token address:", PYUSD_TOKEN_ADDRESS);
  
  // Deploy EthereumPYUSDBridge
  console.log("\n📦 Deploying EthereumPYUSDBridge contract...");
  const EthereumPYUSDBridge = await ethers.getContractFactory("EthereumPYUSDBridge");
  const ethereumBridge = await EthereumPYUSDBridge.deploy(PYUSD_TOKEN_ADDRESS);
  
  await ethereumBridge.waitForDeployment();
  const ethereumBridgeAddress = await ethereumBridge.getAddress();
  console.log("✅ EthereumPYUSDBridge deployed to:", ethereumBridgeAddress);
  
  // Get bridge info
  const bridgeInfo = await ethereumBridge.getBridgeInfo();
  console.log("\n📋 Bridge Information:");
  console.log("Token Address:", bridgeInfo[0]);
  console.log("Total Locked:", ethers.formatUnits(bridgeInfo[1], 6), "PYUSD");
  console.log("Bridge Fee:", ethers.formatEther(bridgeInfo[2]), "ETH");
  console.log("Is Active:", bridgeInfo[3]);
  console.log("Bridge Operator:", bridgeInfo[4]);
  
  // Save deployment info
  const deploymentInfo = {
    network: "ethereum-sepolia",
    chainId: 11155111,
    contracts: {
      EthereumPYUSDBridge: {
        address: ethereumBridgeAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        pyusdTokenAddress: PYUSD_TOKEN_ADDRESS
      }
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("EthereumPYUSDBridge Address:", ethereumBridgeAddress);
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  console.log("Deployer:", deployer.address);
  
  // Create deployments directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }
  
  // Save to file
  fs.writeFileSync(
    `deployments/ethereum-bridge-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Ethereum Bridge deployment completed successfully!");
  console.log("📄 Deployment info saved to deployments/ folder");
  
  console.log("\n📝 Update your .env file:");
  console.log(`ETHEREUM_BRIDGE_ADDRESS=${ethereumBridgeAddress}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Deploy Hedera bridge contract");
  console.log("2. Approve PYUSD tokens for the bridge");
  console.log("3. Test bridge transfer");
  
  return {
    ethereumBridgeAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });