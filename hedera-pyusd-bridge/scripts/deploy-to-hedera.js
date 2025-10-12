const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying PYUSD Bridge to Hedera Testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  // Network configuration
  const HEDERA_CHAIN_ID = 296;
  // Hedera Testnet LayerZero endpoint (updated for 2024)
  const LAYERZERO_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";
  
  // Deploy PYUSDOFT (wrapped PYUSD on Hedera)
  console.log("\n📦 Deploying PYUSDOFT contract...");
  const PYUSDOFT = await ethers.getContractFactory("PYUSDOFT");
  const pyusdOFT = await PYUSDOFT.deploy(
    "PYUSD",                    // name
    "PYUSD",                    // symbol
    LAYERZERO_ENDPOINT,         // LayerZero endpoint
    deployer.address            // owner
  );
  
  await pyusdOFT.waitForDeployment();
  const pyusdOFTAddress = await pyusdOFT.getAddress();
  console.log("✅ PYUSDOFT deployed to:", pyusdOFTAddress);
  
  // Configure LayerZero settings
  console.log("\n⚙️ Configuring LayerZero settings...");
  
  // LayerZero configuration will be done separately
  console.log("⚠️  LayerZero configuration will be done separately after deployment");
  
  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    chainId: HEDERA_CHAIN_ID,
    contracts: {
      PYUSDOFT: {
        address: pyusdOFTAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        layerZeroEndpoint: LAYERZERO_ENDPOINT,
        trustedRemotes: {
          11155111: LAYERZERO_ENDPOINT // Ethereum Sepolia Chain ID
        }
      }
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("PYUSDOFT Address:", pyusdOFTAddress);
  console.log("Deployer:", deployer.address);
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    `deployments/hedera-testnet-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Deployment info saved to deployments/ folder");
  
  return {
    pyusdOFTAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
