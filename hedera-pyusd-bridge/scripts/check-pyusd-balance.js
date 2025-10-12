const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking PYUSD Balance on Ethereum Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Wallet Address:", deployer.address);
  
  // PYUSD token address on Ethereum Sepolia
  const PYUSD_TOKEN_ADDRESS = process.env.PYUSD_ETHEREUM_SEPOLIA || "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  
  try {
    // Get PYUSD token contract
    const ERC20_ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)", 
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    const pyusdToken = new ethers.Contract(PYUSD_TOKEN_ADDRESS, ERC20_ABI, deployer);
    
    // Check token info
    const name = await pyusdToken.name();
    const symbol = await pyusdToken.symbol();
    const decimals = await pyusdToken.decimals();
    const totalSupply = await pyusdToken.totalSupply();
    
    console.log("\n📋 Token Information:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals));
    
    // Check balance
    const balance = await pyusdToken.balanceOf(deployer.address);
    console.log("\n💰 Your PYUSD Balance:");
    console.log("Raw Balance:", balance.toString());
    console.log("Formatted Balance:", ethers.formatUnits(balance, decimals), symbol);
    
    // Check ETH balance for gas
    const ethBalance = await ethers.provider.getBalance(deployer.address);
    console.log("\n⛽ ETH Balance for Gas:");
    console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");
    
    if (balance > 0) {
      console.log("\n✅ You have PYUSD tokens! Ready to bridge.");
    } else {
      console.log("\n❌ No PYUSD tokens found. You need to get some PYUSD first.");
      console.log("You can get PYUSD from:");
      console.log("- PayPal (convert USD to PYUSD)");
      console.log("- Uniswap or other DEXs");
      console.log("- Bridge from other networks");
    }
    
  } catch (error) {
    console.error("❌ Error checking PYUSD balance:", error.message);
    
    if (error.message.includes("call revert exception")) {
      console.log("💡 This might mean the token address is incorrect or the network is wrong.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });