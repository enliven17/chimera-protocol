import hre from "hardhat";
import "dotenv/config";

async function main() {
  console.log("🔍 Verifying ChimeraProtocol on Autoscout...");

  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
  const pythAddress = process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS;

  if (!chimeraAddress) {
    console.error("❌ CHIMERA_CONTRACT_ADDRESS not found in .env");
    return;
  }

  try {
    // Verify ChimeraProtocol contract
    console.log(`📋 Verifying ChimeraProtocol at ${chimeraAddress}...`);
    
    await hre.run("verify:verify", {
      address: chimeraAddress,
      network: "chimera",
      constructorArguments: [
        pyusdAddress, // PYUSD token address
        pythAddress   // Pyth oracle address
      ],
    });

    console.log("✅ ChimeraProtocol verified successfully!");
    console.log(`🔗 View on Autoscout: https://chimera.cloud.blockscout.com/address/${chimeraAddress}`);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });