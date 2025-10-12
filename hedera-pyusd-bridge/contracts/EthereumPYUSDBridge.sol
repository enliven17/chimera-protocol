// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EthereumPYUSDBridge
 * @dev Simple PYUSD bridge for Ethereum Sepolia to Hedera
 * This contract locks PYUSD tokens and emits events for bridge operators
 */
contract EthereumPYUSDBridge is Ownable, ReentrancyGuard {
    
    // Events
    event TokensLocked(
        address indexed user, 
        uint256 amount, 
        string destinationNetwork,
        string destinationAddress,
        uint256 timestamp
    );
    event TokensUnlocked(
        address indexed user, 
        uint256 amount, 
        bytes32 hederaTxHash,
        uint256 timestamp
    );
    
    // State variables
    IERC20 public pyusdToken;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(address => uint256) public lockedBalances;
    
    uint256 public totalLocked;
    uint256 public bridgeFee = 0.001 ether; // 0.001 ETH fee
    bool public bridgeActive = true;
    
    // Bridge operator (can unlock tokens)
    address public bridgeOperator;
    
    constructor(address _pyusdToken) Ownable(msg.sender) {
        pyusdToken = IERC20(_pyusdToken);
        bridgeOperator = msg.sender;
    }
    
    /**
     * @dev Lock PYUSD tokens to bridge to Hedera
     * @param amount Amount of PYUSD to bridge
     * @param hederaAddress Target address on Hedera (0x format)
     */
    function lockTokensToHedera(
        uint256 amount,
        string memory hederaAddress
    ) external payable nonReentrant {
        require(bridgeActive, "Bridge is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(bytes(hederaAddress).length > 0, "Invalid Hedera address");
        
        // Check PYUSD allowance
        require(
            pyusdToken.allowance(msg.sender, address(this)) >= amount,
            "Insufficient PYUSD allowance"
        );
        
        // Transfer PYUSD from user to bridge
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );
        
        // Update locked balance
        lockedBalances[msg.sender] += amount;
        totalLocked += amount;
        
        emit TokensLocked(
            msg.sender, 
            amount, 
            "hedera-testnet",
            hederaAddress,
            block.timestamp
        );
    }
    
    /**
     * @dev Unlock PYUSD tokens (called by bridge operator)
     * @param user User address to unlock tokens for
     * @param amount Amount to unlock
     * @param hederaTxHash Transaction hash from Hedera network
     */
    function unlockTokensFromHedera(
        address user,
        uint256 amount,
        bytes32 hederaTxHash
    ) external nonReentrant {
        require(
            msg.sender == bridgeOperator || msg.sender == owner(),
            "Only bridge operator can unlock"
        );
        require(!processedTransactions[hederaTxHash], "Transaction already processed");
        require(amount > 0, "Amount must be greater than 0");
        require(pyusdToken.balanceOf(address(this)) >= amount, "Insufficient bridge balance");
        
        // Mark transaction as processed
        processedTransactions[hederaTxHash] = true;
        
        // Transfer PYUSD to user
        require(pyusdToken.transfer(user, amount), "PYUSD transfer failed");
        
        // Update locked balance
        if (totalLocked >= amount) {
            totalLocked -= amount;
        }
        
        emit TokensUnlocked(user, amount, hederaTxHash, block.timestamp);
    }
    
    /**
     * @dev Get bridge status and info
     */
    function getBridgeInfo() external view returns (
        address tokenAddress,
        uint256 totalLockedAmount,
        uint256 bridgeFeeAmount,
        bool isActive,
        address operator
    ) {
        return (
            address(pyusdToken),
            totalLocked,
            bridgeFee,
            bridgeActive,
            bridgeOperator
        );
    }
    
    /**
     * @dev Get user's locked balance
     */
    function getUserLockedBalance(address user) external view returns (uint256) {
        return lockedBalances[user];
    }
    
    /**
     * @dev Set bridge operator (only owner)
     */
    function setBridgeOperator(address _operator) external onlyOwner {
        bridgeOperator = _operator;
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
    
    /**
     * @dev Check if transaction is processed
     */
    function isTransactionProcessed(bytes32 txHash) external view returns (bool) {
        return processedTransactions[txHash];
    }
}