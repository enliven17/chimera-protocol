// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HederaPYUSDBridge
 * @dev Simple PYUSD bridge for Hedera using HTS (Hedera Token Service)
 * This contract creates a wrapped PYUSD token on Hedera and manages bridging
 */
contract HederaPYUSDBridge is Ownable, ReentrancyGuard {
    
    // Events
    event TokensLocked(address indexed user, uint256 amount, string destinationAddress);
    event TokensUnlocked(address indexed user, uint256 amount, bytes32 txHash);
    event TokensMinted(address indexed user, uint256 amount, bytes32 sourceTxHash);
    event TokensBurned(address indexed user, uint256 amount, string destinationAddress);
    
    // State variables
    IERC20 public pyusdToken;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(address => uint256) public lockedBalances;
    
    uint256 public totalLocked;
    uint256 public bridgeFee = 0.001 ether; // 0.001 HBAR fee
    bool public bridgeActive = true;
    
    // Supported networks
    mapping(string => bool) public supportedNetworks;
    
    constructor(address _pyusdToken) Ownable(msg.sender) {
        pyusdToken = IERC20(_pyusdToken);
        
        // Add supported networks
        supportedNetworks["ethereum-sepolia"] = true;
        supportedNetworks["ethereum-mainnet"] = true;
    }
    
    /**
     * @dev Lock PYUSD tokens to bridge to another network
     * @param amount Amount of PYUSD to bridge
     * @param destinationNetwork Target network (e.g., "ethereum-sepolia")
     * @param destinationAddress Target address on destination network
     */
    function lockTokens(
        uint256 amount,
        string memory destinationNetwork,
        string memory destinationAddress
    ) external payable nonReentrant {
        require(bridgeActive, "Bridge is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(supportedNetworks[destinationNetwork], "Unsupported network");
        require(bytes(destinationAddress).length > 0, "Invalid destination address");
        
        // Transfer PYUSD from user to bridge
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );
        
        // Update locked balance
        lockedBalances[msg.sender] += amount;
        totalLocked += amount;
        
        emit TokensLocked(msg.sender, amount, destinationAddress);
    }
    
    /**
     * @dev Unlock PYUSD tokens (called by bridge operator)
     * @param user User address to unlock tokens for
     * @param amount Amount to unlock
     * @param sourceTxHash Transaction hash from source network
     */
    function unlockTokens(
        address user,
        uint256 amount,
        bytes32 sourceTxHash
    ) external onlyOwner nonReentrant {
        require(!processedTransactions[sourceTxHash], "Transaction already processed");
        require(amount > 0, "Amount must be greater than 0");
        require(pyusdToken.balanceOf(address(this)) >= amount, "Insufficient bridge balance");
        
        // Mark transaction as processed
        processedTransactions[sourceTxHash] = true;
        
        // Transfer PYUSD to user
        require(pyusdToken.transfer(user, amount), "PYUSD transfer failed");
        
        // Update locked balance
        if (lockedBalances[user] >= amount) {
            lockedBalances[user] -= amount;
        }
        totalLocked -= amount;
        
        emit TokensUnlocked(user, amount, sourceTxHash);
    }
    
    /**
     * @dev Mint wrapped PYUSD tokens (for tokens coming from other networks)
     * @param user User address to mint tokens for
     * @param amount Amount to mint
     * @param sourceTxHash Transaction hash from source network
     */
    function mintTokens(
        address user,
        uint256 amount,
        bytes32 sourceTxHash
    ) external onlyOwner nonReentrant {
        require(!processedTransactions[sourceTxHash], "Transaction already processed");
        require(amount > 0, "Amount must be greater than 0");
        
        // Mark transaction as processed
        processedTransactions[sourceTxHash] = true;
        
        // This would mint wrapped PYUSD tokens
        // For now, we'll use the existing PYUSD balance
        require(pyusdToken.transfer(user, amount), "PYUSD transfer failed");
        
        emit TokensMinted(user, amount, sourceTxHash);
    }
    
    /**
     * @dev Burn wrapped PYUSD tokens to bridge to another network
     * @param amount Amount to burn
     * @param destinationNetwork Target network
     * @param destinationAddress Target address
     */
    function burnTokens(
        uint256 amount,
        string memory destinationNetwork,
        string memory destinationAddress
    ) external payable nonReentrant {
        require(bridgeActive, "Bridge is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(supportedNetworks[destinationNetwork], "Unsupported network");
        
        // Transfer PYUSD from user to bridge (effectively burning)
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );
        
        emit TokensBurned(msg.sender, amount, destinationAddress);
    }
    
    /**
     * @dev Get bridge status and info
     */
    function getBridgeInfo() external view returns (
        address tokenAddress,
        uint256 totalLockedAmount,
        uint256 bridgeFeeAmount,
        bool isActive
    ) {
        return (
            address(pyusdToken),
            totalLocked,
            bridgeFee,
            bridgeActive
        );
    }
    
    /**
     * @dev Set bridge fee (only owner)
     */
    function setBridgeFee(uint256 _fee) external onlyOwner {
        bridgeFee = _fee;
    }
    
    /**
     * @dev Toggle bridge active state (only owner)
     */
    function toggleBridge() external onlyOwner {
        bridgeActive = !bridgeActive;
    }
    
    /**
     * @dev Add supported network (only owner)
     */
    function addSupportedNetwork(string memory network) external onlyOwner {
        supportedNetworks[network] = true;
    }
    
    /**
     * @dev Remove supported network (only owner)
     */
    function removeSupportedNetwork(string memory network) external onlyOwner {
        supportedNetworks[network] = false;
    }
    
    /**
     * @dev Withdraw bridge fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
    
    /**
     * @dev Emergency withdraw PYUSD (only owner)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(pyusdToken.transfer(owner(), amount), "Emergency withdrawal failed");
    }
}