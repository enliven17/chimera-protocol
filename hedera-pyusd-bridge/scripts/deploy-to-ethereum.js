const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying PYUSD Bridge to Ethereum Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Network configuration
  const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
  const LAYERZERO_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f"; // Ethereum Sepolia LayerZero endpoint
  
  // PYUSD token address on Ethereum Sepolia (Real PYUSD)
  const PYUSD_TOKEN_ADDRESS = process.env.PYUSD_ETHEREUM_SEPOLIA || "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  console.log("✅ Using real PYUSD token address:", PYUSD_TOKEN_ADDRESS);
  
  // Deploy PYUSDOFTAdapter (adapter for existing PYUSD token)
  console.log("\n📦 Deploying PYUSDOFTAdapter contract...");
  const PYUSDOFTAdapter = await ethers.getContractFactory("PYUSDOFTAdapter");
  const pyusdAdapter = await PYUSDOFTAdapter.deploy(
    PYUSD_TOKEN_ADDRESS,        // Real PYUSD token address
    LAYERZERO_ENDPOINT,         // LayerZero endpoint
    deployer.address            // owner
  );
  
  await pyusdAdapter.waitForDeployment();
  const pyusdAdapterAddress = await pyusdAdapter.getAddress();
  console.log("✅ PYUSDOFTAdapter deployed to:", pyusdAdapterAddress);
  
  // Configure LayerZero settings
  console.log("\n⚙️ Configuring LayerZero settings...");
  
  // LayerZero configuration will be done after both contracts are deployed
  console.log("⚠️  LayerZero configuration will be done separately after Hedera deployment");
  
  console.log("\n📝 Next steps:");
  console.log("1. Deploy PYUSD OFT to Hedera Testnet");
  console.log("2. Configure LayerZero peer connections");
  console.log("3. Approve PYUSD tokens for the adapter");
  console.log("4. Test the bridge transfer");
  
  // Save deployment info
  const deploymentInfo = {
    network: "ethereum-sepolia",
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    contracts: {
      PYUSDOFTAdapter: {
        address: pyusdAdapterAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        layerZeroEndpoint: LAYERZERO_ENDPOINT,
        pyusdTokenAddress: PYUSD_TOKEN_ADDRESS,
        trustedRemotes: {
          296: LAYERZERO_ENDPOINT // Hedera Chain ID
        }
      }
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("PYUSDOFTAdapter Address:", pyusdAdapterAddress);
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  console.log("Deployer:", deployer.address);
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    `deployments/ethereum-sepolia-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Deployment info saved to deployments/ folder");
  
  return {
    pyusdAdapterAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
