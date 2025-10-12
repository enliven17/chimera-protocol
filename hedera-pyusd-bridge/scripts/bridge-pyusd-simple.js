const { ethers } = require("hardhat");

async function main() {
  console.log("🌉 Starting Simple PYUSD Bridge Transfer...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Configuration
  const ETHEREUM_BRIDGE_ADDRESS = process.env.ETHEREUM_BRIDGE_ADDRESS || "0x4Ca5E06778eBd5d848b6130eD717eb836C58B228";
  const PYUSD_TOKEN_ADDRESS = process.env.PYUSD_ETHEREUM_SEPOLIA || "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const HEDERA_ADDRESS = deployer.address; // Same address on Hedera
  const TRANSFER_AMOUNT = "40"; // 40 PYUSD
  const BRIDGE_FEE = "0.001"; // 0.001 ETH
  
  console.log("Ethereum Bridge Address:", ETHEREUM_BRIDGE_ADDRESS);
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  console.log("Hedera Destination Address:", HEDERA_ADDRESS);
  console.log("Transfer Amount:", TRANSFER_AMOUNT, "PYUSD");
  console.log("Bridge Fee:", BRIDGE_FEE, "ETH");
  
  // Get contracts
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];
  
  const pyusdToken = new ethers.Contract(PYUSD_TOKEN_ADDRESS, ERC20_ABI, deployer);
  const ethereumBridge = await ethers.getContractAt("EthereumPYUSDBridge", ETHEREUM_BRIDGE_ADDRESS);
  
  // Check balances
  console.log("\n💰 Checking balances...");
  const pyusdBalance = await pyusdToken.balanceOf(deployer.address);
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  
  console.log("PYUSD Balance:", ethers.formatUnits(pyusdBalance, 6), "PYUSD");
  console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  
  // Check requirements
  const requiredPYUSD = ethers.parseUnits(TRANSFER_AMOUNT, 6);
  const requiredETH = ethers.parseEther(BRIDGE_FEE);
  
  if (pyusdBalance < requiredPYUSD) {
    console.log("❌ Error: Insufficient PYUSD balance");
    console.log("Required:", TRANSFER_AMOUNT, "PYUSD");
    console.log("Available:", ethers.formatUnits(pyusdBalance, 6), "PYUSD");
    process.exit(1);
  }
  
  if (ethBalance < requiredETH) {
    console.log("❌ Error: Insufficient ETH for bridge fee");
    console.log("Required:", BRIDGE_FEE, "ETH");
    console.log("Available:", ethers.formatEther(ethBalance), "ETH");
    process.exit(1);
  }
  
  // Check allowance
  console.log("\n🔐 Checking PYUSD allowance...");
  const allowance = await pyusdToken.allowance(deployer.address, ETHEREUM_BRIDGE_ADDRESS);
  console.log("Current Allowance:", ethers.formatUnits(allowance, 6), "PYUSD");
  
  if (allowance < requiredPYUSD) {
    console.log("📝 Approving PYUSD tokens for bridge...");
    const approveTx = await pyusdToken.approve(ETHEREUM_BRIDGE_ADDRESS, ethers.MaxUint256);
    console.log("Approval transaction hash:", approveTx.hash);
    await approveTx.wait();
    console.log("✅ PYUSD tokens approved");
  } else {
    console.log("✅ Sufficient allowance already exists");
  }
  
  // Get bridge info
  console.log("\n📋 Bridge Information:");
  const bridgeInfo = await ethereumBridge.getBridgeInfo();
  console.log("Bridge Token:", bridgeInfo[0]);
  console.log("Total Locked:", ethers.formatUnits(bridgeInfo[1], 6), "PYUSD");
  console.log("Bridge Fee:", ethers.formatEther(bridgeInfo[2]), "ETH");
  console.log("Is Active:", bridgeInfo[3]);
  console.log("Bridge Operator:", bridgeInfo[4]);
  
  if (!bridgeInfo[3]) {
    console.log("❌ Error: Bridge is not active");
    process.exit(1);
  }
  
  // Execute the bridge transfer
  console.log("\n🚀 Executing PYUSD bridge transfer...");
  console.log("Locking", TRANSFER_AMOUNT, "PYUSD on Ethereum Sepolia");
  console.log("Destination: Hedera Testnet -", HEDERA_ADDRESS);
  
  const lockTx = await ethereumBridge.lockTokensToHedera(
    requiredPYUSD,
    HEDERA_ADDRESS,
    {
      value: requiredETH,
      gasLimit: 200000
    }
  );
  
  console.log("Lock transaction hash:", lockTx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await lockTx.wait();
  console.log("✅ Transfer confirmed!");
  console.log("Gas used:", receipt.gasUsed.toString());
  
  // Parse events
  const lockEvent = receipt.logs.find(log => {
    try {
      const parsed = ethereumBridge.interface.parseLog(log);
      return parsed.name === 'TokensLocked';
    } catch (e) {
      return false;
    }
  });
  
  if (lockEvent) {
    const parsed = ethereumBridge.interface.parseLog(lockEvent);
    console.log("\n📋 Lock Event Details:");
    console.log("User:", parsed.args.user);
    console.log("Amount:", ethers.formatUnits(parsed.args.amount, 6), "PYUSD");
    console.log("Destination Network:", parsed.args.destinationNetwork);
    console.log("Destination Address:", parsed.args.destinationAddress);
    console.log("Timestamp:", new Date(Number(parsed.args.timestamp) * 1000).toISOString());
  }
  
  // Check final balances
  console.log("\n📊 Final Balances:");
  const finalPYUSDBalance = await pyusdToken.balanceOf(deployer.address);
  const finalETHBalance = await ethers.provider.getBalance(deployer.address);
  const bridgeBalance = await pyusdToken.balanceOf(ETHEREUM_BRIDGE_ADDRESS);
  
  console.log("Your PYUSD Balance:", ethers.formatUnits(finalPYUSDBalance, 6), "PYUSD");
  console.log("Your ETH Balance:", ethers.formatEther(finalETHBalance), "ETH");
  console.log("Bridge PYUSD Balance:", ethers.formatUnits(bridgeBalance, 6), "PYUSD");
  
  console.log("\n🎉 PYUSD Bridge Transfer Completed Successfully!");
  console.log("📋 Transfer Summary:");
  console.log("- Amount:", TRANSFER_AMOUNT, "PYUSD");
  console.log("- From: Ethereum Sepolia");
  console.log("- To: Hedera Testnet");
  console.log("- Destination Address:", HEDERA_ADDRESS);
  console.log("- Transaction Hash:", lockTx.hash);
  
  console.log("\n⏰ Next Steps:");
  console.log("1. Wait for bridge operator to process the transfer");
  console.log("2. Check Hedera Testnet for wrapped PYUSD tokens");
  console.log("3. Bridge operator will mint wPYUSD on Hedera");
  
  console.log("\n🔗 Monitor your transaction:");
  console.log("Ethereum Sepolia:", `https://sepolia.etherscan.io/tx/${lockTx.hash}`);
  console.log("Hedera Testnet:", "https://hashscan.io/testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Bridge transfer failed:", error);
    process.exit(1);
  });