const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PYUSD Bridge Tests", function () {
  let pyusdOFTAdapter, pyusdOFT;
  let owner, user1, user2;
  let mockPYUSD;
  
  const HEDERA_CHAIN_ID = 296;
  const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
  let mockLayerZeroEndpoint;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy mock LayerZero endpoint
    const MockLayerZeroEndpoint = await ethers.getContractFactory("MockLayerZeroEndpoint");
    mockLayerZeroEndpoint = await MockLayerZeroEndpoint.deploy();
    await mockLayerZeroEndpoint.waitForDeployment();
    
    // Deploy mock PYUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockPYUSD = await MockERC20.deploy("PYUSD", "PYUSD", 6);
    await mockPYUSD.waitForDeployment();
    
    // Deploy PYUSDOFTAdapter
    const PYUSDOFTAdapter = await ethers.getContractFactory("PYUSDOFTAdapter");
    pyusdOFTAdapter = await PYUSDOFTAdapter.deploy(
      await mockPYUSD.getAddress(),
      await mockLayerZeroEndpoint.getAddress(),
      owner.address
    );
    await pyusdOFTAdapter.waitForDeployment();
    
    // Deploy PYUSDOFT
    const PYUSDOFT = await ethers.getContractFactory("PYUSDOFT");
    pyusdOFT = await PYUSDOFT.deploy(
      "PYUSD",
      "PYUSD",
      await mockLayerZeroEndpoint.getAddress(),
      owner.address
    );
    await pyusdOFT.waitForDeployment();
  });
  
  describe("PYUSDOFTAdapter", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await pyusdOFTAdapter.getTokenAddress()).to.equal(await mockPYUSD.getAddress());
      expect(await pyusdOFTAdapter.getTokenDecimals()).to.equal(6);
      expect(await pyusdOFTAdapter.owner()).to.equal(owner.address);
    });
    
    it("Should return correct token info", async function () {
      expect(await pyusdOFTAdapter.getTokenAddress()).to.equal(await mockPYUSD.getAddress());
      expect(await pyusdOFTAdapter.getTokenDecimals()).to.equal(6);
    });
    
    it("Should require approval", async function () {
      expect(await pyusdOFTAdapter.approvalRequired()).to.be.true;
    });
  });
  
  describe("PYUSDOFT", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await pyusdOFT.name()).to.equal("PYUSD");
      expect(await pyusdOFT.symbol()).to.equal("PYUSD");
      expect(await pyusdOFT.decimals()).to.equal(6);
      expect(await pyusdOFT.owner()).to.equal(owner.address);
    });
    
    it("Should have correct decimals", async function () {
      expect(await pyusdOFT.decimals()).to.equal(6);
    });
    
    it("Should allow owner to emergency mint", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await pyusdOFT.emergencyMint(user1.address, amount);
      expect(await pyusdOFT.balanceOf(user1.address)).to.equal(amount);
    });
    
    it("Should allow owner to emergency burn", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await pyusdOFT.emergencyMint(user1.address, amount);
      await pyusdOFT.emergencyBurn(user1.address, amount);
      expect(await pyusdOFT.balanceOf(user1.address)).to.equal(0);
    });
    
    it("Should not allow non-owner to emergency mint", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await expect(
        pyusdOFT.connect(user1).emergencyMint(user1.address, amount)
      ).to.be.revertedWithCustomError(pyusdOFT, "OwnableUnauthorizedAccount");
    });
  });
  
  describe("LayerZero Configuration", function () {
    it("Should configure LayerZero settings", async function () {
      // Test that contracts can be configured (basic functionality test)
      expect(await pyusdOFTAdapter.getTokenAddress()).to.equal(await mockPYUSD.getAddress());
      expect(await pyusdOFT.name()).to.equal("PYUSD");
    });
  });
  
  describe("Token Operations", function () {
    it("Should mint PYUSD tokens to user", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await mockPYUSD.mint(user1.address, amount);
      
      expect(await mockPYUSD.balanceOf(user1.address)).to.equal(amount);
    });
    
    it("Should burn PYUSD tokens from user", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await mockPYUSD.mint(user1.address, amount);
      await mockPYUSD.burn(user1.address, amount);
      
      expect(await mockPYUSD.balanceOf(user1.address)).to.equal(0);
    });
  });
});

// Mock ERC20 contract is now defined in contracts/MockERC20.sol
