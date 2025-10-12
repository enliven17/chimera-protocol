const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying ChimeraProtocol to Hedera Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "HBAR");

  // Contract addresses on Hedera Testnet
  const PYTH_CONTRACT = "0x2880aB155794e7179c9eE2e38200202908C17B43"; // Pyth Oracle on Hedera Testnet
  const PYUSD_CONTRACT = "0x95bc083e6911DeBc46b36cDCE8996fAEB28bf9A6"; // Our wrapped PYUSD

  console.log("🔗 Using Pyth Oracle:", PYTH_CONTRACT);
  console.log("💵 Using PYUSD Token:", PYUSD_CONTRACT);

  // Deploy ChimeraProtocol
  console.log("\n📦 Deploying ChimeraProtocol contract...");
  const ChimeraProtocol = await ethers.getContractFactory("ChimeraProtocol");
  
  const chimeraProtocol = await ChimeraProtocol.deploy(
    PYTH_CONTRACT,
    PYUSD_CONTRACT
  );

  await chimeraProtocol.waitForDeployment();
  const chimeraAddress = await chimeraProtocol.getAddress();

  console.log("✅ ChimeraProtocol deployed to:", chimeraAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const pyth = await chimeraProtocol.pyth();
  const pyusd = await chimeraProtocol.pyusdToken();
  const owner = await chimeraProtocol.owner();

  console.log("📊 Contract verification:");
  console.log("  - Pyth Oracle:", pyth);
  console.log("  - PYUSD Token:", pyusd);
  console.log("  - Owner:", owner);

  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    chainId: 296,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ChimeraProtocol: {
        address: chimeraAddress,
        pythOracle: pyth,
        pyusdToken: pyusd,
        owner: owner
      }
    }
  };

  const fs = require("fs");
  const deploymentPath = `deployments/chimera-hedera-testnet-${Date.now()}.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("1. Update NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS in .env");
  console.log("2. Verify contract on Hashscan");
  console.log("3. Set up Envio indexer");
  console.log("4. Configure ASI and Lit Protocol agents");

  return {
    chimeraProtocol: chimeraAddress,
    pyth: pyth,
    pyusd: pyusd
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });