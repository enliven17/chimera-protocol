const { ethers } = require("hardhat");

async function configureLayerZero() {
  console.log("⚙️ Configuring LayerZero for PYUSD Bridge...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Contract addresses
  const HEDERA_PYUSD_OFT = "0x95bc083e6911DeBc46b36cDCE8996fAEB28bf9A6";
  const ETHEREUM_PYUSD_ADAPTER = "0xAc0496777AF850441D6804a4C09ae10A880E0CD0";
  
  // Chain IDs
  const HEDERA_CHAIN_ID = 296;
  const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
  
  console.log("\n🔗 Configuring Hedera PYUSDOFT...");
  
  // Connect to Hedera network
  const hederaProvider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
  const hederaSigner = new ethers.Wallet(process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", hederaProvider);
  
  const pyusdOFT = new ethers.Contract(HEDERA_PYUSD_OFT, [
    "function setTrustedRemote(uint32 _srcEid, bytes calldata _path) external",
    "function getTrustedRemoteAddress(uint32 _srcEid) external view returns (bytes32)",
    "function owner() external view returns (address)"
  ], hederaSigner);
  
  try {
    // Check if trusted remote is already set
    const currentRemote = await pyusdOFT.getTrustedRemoteAddress(ETHEREUM_SEPOLIA_CHAIN_ID);
    console.log("Current trusted remote:", currentRemote);
    
    if (currentRemote === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log("Setting trusted remote for Ethereum Sepolia...");
      
      // Create the trusted remote path (Ethereum adapter address + Hedera OFT address)
      const trustedRemotePath = ethers.concat([
        ethers.zeroPadValue(ETHEREUM_PYUSD_ADAPTER, 20),
        ethers.zeroPadValue(HEDERA_PYUSD_OFT, 20)
      ]);
      
      const tx = await pyusdOFT.setTrustedRemote(ETHEREUM_SEPOLIA_CHAIN_ID, trustedRemotePath);
      await tx.wait();
      console.log("✅ Trusted remote set for Ethereum Sepolia");
    } else {
      console.log("✅ Trusted remote already configured");
    }
  } catch (error) {
    console.log("⚠️  Could not configure Hedera trusted remote:", error.message);
  }
  
  console.log("\n🔗 Configuring Ethereum PYUSDOFTAdapter...");
  
  // Connect to Ethereum Sepolia
  const ethProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia.publicnode.com");
  const ethSigner = new ethers.Wallet(process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", ethProvider);
  
  const pyusdAdapter = new ethers.Contract(ETHEREUM_PYUSD_ADAPTER, [
    "function setTrustedRemote(uint32 _srcEid, bytes calldata _path) external",
    "function getTrustedRemoteAddress(uint32 _srcEid) external view returns (bytes32)",
    "function owner() external view returns (address)"
  ], ethSigner);
  
  try {
    // Check if trusted remote is already set
    const currentRemote = await pyusdAdapter.getTrustedRemoteAddress(HEDERA_CHAIN_ID);
    console.log("Current trusted remote:", currentRemote);
    
    if (currentRemote === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log("Setting trusted remote for Hedera...");
      
      // Create the trusted remote path (Hedera OFT address + Ethereum adapter address)
      const trustedRemotePath = ethers.concat([
        ethers.zeroPadValue(HEDERA_PYUSD_OFT, 20),
        ethers.zeroPadValue(ETHEREUM_PYUSD_ADAPTER, 20)
      ]);
      
      const tx = await pyusdAdapter.setTrustedRemote(HEDERA_CHAIN_ID, trustedRemotePath);
      await tx.wait();
      console.log("✅ Trusted remote set for Hedera");
    } else {
      console.log("✅ Trusted remote already configured");
    }
  } catch (error) {
    console.log("⚠️  Could not configure Ethereum trusted remote:", error.message);
  }
  
  console.log("\n🎉 LayerZero configuration completed!");
  console.log("Now you can run the bridge transfer:");
  console.log("npm run bridge:pyusd");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration failed:", error);
    process.exit(1);
  });

async function main() {
  await configureLayerZero();
}
