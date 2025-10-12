const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Hedera PYUSD Bridge to Testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  if (balance < ethers.parseEther("10")) {
    console.log("❌ Error: Insufficient HBAR balance for deployment");
    console.log("Please add some HBAR to your wallet");
    process.exit(1);
  }
  
  // First deploy a wrapped PYUSD token on Hedera
  console.log("\n📦 Deploying Wrapped PYUSD token...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const wrappedPYUSD = await MockERC20.deploy(
    "Wrapped PayPal USD",
    "wPYUSD",
    6, // PYUSD has 6 decimals
    {
      gasLimit: 3000000,
      gasPrice: 510000000000
    }
  );
  
  await wrappedPYUSD.waitForDeployment();
  const wrappedPYUSDAddress = await wrappedPYUSD.getAddress();
  console.log("✅ Wrapped PYUSD deployed to:", wrappedPYUSDAddress);
  
  // Deploy HederaPYUSDBridge
  console.log("\n📦 Deploying HederaPYUSDBridge contract...");
  const HederaPYUSDBridge = await ethers.getContractFactory("HederaPYUSDBridge");
  const hederaBridge = await HederaPYUSDBridge.deploy(
    wrappedPYUSDAddress,
    {
      gasLimit: 3000000,
      gasPrice: 510000000000
    }
  );
  
  await hederaBridge.waitForDeployment();
  const hederaBridgeAddress = await hederaBridge.getAddress();
  console.log("✅ HederaPYUSDBridge deployed to:", hederaBridgeAddress);
  
  // Mint some wrapped PYUSD to the bridge for initial liquidity
  console.log("\n💰 Minting initial wrapped PYUSD to bridge...");
  const mintTx = await wrappedPYUSD.mint(
    hederaBridgeAddress, 
    ethers.parseUnits("100000", 6), // 100K wPYUSD
    {
      gasLimit: 1000000,
      gasPrice: 510000000000
    }
  );
  await mintTx.wait();
  console.log("✅ Minted 100,000 wPYUSD to bridge for liquidity");
  
  // Get bridge info
  const bridgeInfo = await hederaBridge.getBridgeInfo();
  console.log("\n📋 Bridge Information:");
  console.log("Token Address:", bridgeInfo[0]);
  console.log("Total Locked:", ethers.formatUnits(bridgeInfo[1], 6), "wPYUSD");
  console.log("Bridge Fee:", ethers.formatEther(bridgeInfo[2]), "HBAR");
  console.log("Is Active:", bridgeInfo[3]);
  
  // Check wrapped PYUSD balance
  const bridgeBalance = await wrappedPYUSD.balanceOf(hederaBridgeAddress);
  console.log("Bridge wPYUSD Balance:", ethers.formatUnits(bridgeBalance, 6), "wPYUSD");
  
  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    chainId: 296,
    contracts: {
      HederaPYUSDBridge: {
        address: hederaBridgeAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        wrappedPYUSDAddress: wrappedPYUSDAddress
      },
      WrappedPYUSD: {
        address: wrappedPYUSDAddress,
        name: "Wrapped PayPal USD",
        symbol: "wPYUSD",
        decimals: 6
      }
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("HederaPYUSDBridge Address:", hederaBridgeAddress);
  console.log("Wrapped PYUSD Address:", wrappedPYUSDAddress);
  console.log("Deployer:", deployer.address);
  
  // Create deployments directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }
  
  // Save to file
  fs.writeFileSync(
    `deployments/hedera-bridge-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Hedera Bridge deployment completed successfully!");
  console.log("📄 Deployment info saved to deployments/ folder");
  
  console.log("\n📝 Update your .env file:");
  console.log(`HEDERA_BRIDGE_ADDRESS=${hederaBridgeAddress}`);
  console.log(`WRAPPED_PYUSD_ADDRESS=${wrappedPYUSDAddress}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Configure bridge operator addresses");
  console.log("2. Test bridge transfer from Ethereum");
  console.log("3. Set up monitoring for cross-chain events");
  
  return {
    hederaBridgeAddress,
    wrappedPYUSDAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });