// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title PYUSDBridge
 * @dev Bridge contract for locking PYUSD on Ethereum and minting wPYUSD on Hedera
 */
contract PYUSDBridge {
    IERC20 public immutable pyusdToken;
    address public owner;
    
    // Bridge state
    uint256 public totalLocked;
    uint256 public bridgeFee; // Fee in basis points (100 = 1%)
    address public feeRecipient;
    bool public paused;
    
    // Mapping to track processed transactions (prevent double spending)
    mapping(bytes32 => bool) public processedTransactions;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    // Events
    event TokensLocked(
        address indexed user,
        uint256 amount,
        uint256 fee,
        string destinationNetwork,
        string destinationAddress,
        bytes32 indexed lockId
    );
    
    event TokensUnlocked(
        address indexed user,
        uint256 amount,
        bytes32 indexed unlockId
    );
    
    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    constructor(
        address _pyusdToken,
        uint256 _bridgeFee,
        address _feeRecipient
    ) {
        require(_pyusdToken != address(0), "Invalid PYUSD token address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_bridgeFee <= 1000, "Fee too high"); // Max 10%
        
        owner = msg.sender;
        pyusdToken = IERC20(_pyusdToken);
        bridgeFee = _bridgeFee;
        feeRecipient = _feeRecipient;
        paused = false;
    }
    
    /**
     * @dev Lock PYUSD tokens for bridging to Hedera
     * @param amount Amount of PYUSD to lock
     * @param destinationNetwork Target network (e.g., "hedera-testnet")
     * @param destinationAddress Address on destination network
     */
    function lockTokens(
        uint256 amount,
        string calldata destinationNetwork,
        string calldata destinationAddress
    ) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(destinationNetwork).length > 0, "Invalid destination network");
        require(bytes(destinationAddress).length > 0, "Invalid destination address");
        
        // Calculate fee
        uint256 fee = (amount * bridgeFee) / 10000;
        uint256 netAmount = amount - fee;
        
        require(netAmount > 0, "Amount too small after fee");
        
        // Transfer PYUSD from user to bridge
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );
        
        // Transfer fee to fee recipient
        if (fee > 0) {
            require(
                pyusdToken.transfer(feeRecipient, fee),
                "Fee transfer failed"
            );
        }
        
        // Update total locked amount
        totalLocked += netAmount;
        
        // Generate unique lock ID
        bytes32 lockId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                destinationNetwork,
                destinationAddress,
                block.timestamp,
                block.number
            )
        );
        
        emit TokensLocked(
            msg.sender,
            netAmount,
            fee,
            destinationNetwork,
            destinationAddress,
            lockId
        );
    }
    
    /**
     * @dev Unlock PYUSD tokens (called by bridge operator for reverse bridge)
     * @param user User to receive unlocked tokens
     * @param amount Amount to unlock
     * @param unlockId Unique identifier for this unlock
     */
    function unlockTokens(
        address user,
        uint256 amount,
        bytes32 unlockId
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(!processedTransactions[unlockId], "Transaction already processed");
        require(amount <= totalLocked, "Insufficient locked tokens");
        
        // Mark transaction as processed
        processedTransactions[unlockId] = true;
        
        // Update total locked amount
        totalLocked -= amount;
        
        // Transfer PYUSD to user
        require(
            pyusdToken.transfer(user, amount),
            "PYUSD transfer failed"
        );
        
        emit TokensUnlocked(user, amount, unlockId);
    }
    
    /**
     * @dev Get bridge information
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
            !paused
        );
    }
    
    /**
     * @dev Update bridge fee (only owner)
     */
    function setBridgeFee(uint256 _bridgeFee) external onlyOwner {
        require(_bridgeFee <= 1000, "Fee too high"); // Max 10%
        
        uint256 oldFee = bridgeFee;
        bridgeFee = _bridgeFee;
        
        emit BridgeFeeUpdated(oldFee, _bridgeFee);
    }
    
    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = _feeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, _feeRecipient);
    }
    
    /**
     * @dev Pause bridge operations (only owner)
     */
    function pause() external onlyOwner {
        paused = true;
    }
    
    /**
     * @dev Unpause bridge operations (only owner)
     */
    function unpause() external onlyOwner {
        paused = false;
    }
    
    /**
     * @dev Emergency withdrawal (only owner, when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(paused, "Contract not paused");
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).transfer(owner, amount);
    }
    
    /**
     * @dev Get contract balance for a specific token
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}