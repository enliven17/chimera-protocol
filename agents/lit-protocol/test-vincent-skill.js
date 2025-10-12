/**
 * Test script for ChimeraProtocol Vincent Skill
 */

const { ChimeraVincentSkill, config } = require("./chimera-vincent-skill");
require("dotenv").config({ path: "../../.env" });

async function testVincentSkill() {
  console.log("🧪 Testing ChimeraProtocol Vincent Skill...");

  try {
    // Initialize skill
    const skill = new ChimeraVincentSkill(config);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for initialization

    // Test 1: Get skill status
    console.log("\n1️⃣ Testing skill status...");
    const status = skill.getStatus();
    console.log("Status:", status);

    // Test 2: Check delegation
    console.log("\n2️⃣ Testing delegation check...");
    const testUserAddress = "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123";
    
    const delegationResult = await skill.executeSkill({
      action: "check_delegation",
      userAddress: testUserAddress
    });
    
    console.log("Delegation result:", delegationResult);

    // Test 3: Get market info
    console.log("\n3️⃣ Testing market info...");
    const marketResult = await skill.executeSkill({
      action: "get_market_info",
      marketId: 1
    });
    
    console.log("Market result:", marketResult);

    // Test 4: Simulate bet placement (will fail without proper setup, but tests logic)
    console.log("\n4️⃣ Testing bet placement logic...");
    try {
      const betResult = await skill.executeSkill({
        action: "place_bet",
        marketId: 1,
        option: 0,
        amount: "10000000000000000000", // 10 PYUSD
        userAddress: testUserAddress,
        analysis: {
          confidence: 0.8,
          recommendation: "BUY_A",
          reasoning: "Test bet"
        }
      });
      
      console.log("Bet result:", betResult);
    } catch (error) {
      console.log("Expected error (no delegation):", error.message);
    }

    console.log("\n✅ Vincent Skill tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run tests if called directly
if (require.main === module) {
  testVincentSkill()
    .then(() => {
      console.log("🎉 All tests passed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Tests failed:", error);
      process.exit(1);
    });
}

module.exports = { testVincentSkill };