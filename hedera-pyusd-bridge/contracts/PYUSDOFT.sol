// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {OFT} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PYUSDOFT
 * @dev PYUSD token implementation for Hedera Testnet using LayerZero OFT
 * This contract creates a wrapped PYUSD token on Hedera Testnet
 */
contract PYUSDOFT is OFT {
    
    event PYUSDMinted(address indexed to, uint256 amount);
    event PYUSDBurned(address indexed from, uint256 amount);
    
    constructor(
        string memory _name,      // Token name: "PYUSD"
        string memory _symbol,    // Token symbol: "PYUSD"
        address _lzEndpoint,     // LayerZero endpoint address
        address _owner           // Contract owner
    ) OFT(_name, _symbol, _lzEndpoint, _owner) Ownable(_owner) {
        // PYUSD has 6 decimals
        // Mint initial supply to owner (optional)
        // _mint(_owner, 1000000 * 10**6); // 1M PYUSD
    }
    
    /**
     * @dev Override the _debit function to add custom logic
     * @param _from The address to debit tokens from
     * @param _amountLD The amount of tokens to send in local decimals
     * @param _minAmountLD The minimum amount to send in local decimals
     * @param _dstEid The destination chain ID
     * @return amountSentLD The amount sent in local decimals
     * @return amountReceivedLD The amount received in local decimals on the remote
     */
    function _debit(
        address _from,
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal virtual override returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        // Call parent _debit function
        (amountSentLD, amountReceivedLD) = super._debit(_from, _amountLD, _minAmountLD, _dstEid);
        
        // Emit burn event
        emit PYUSDBurned(_from, amountSentLD);
    }
    
    /**
     * @dev Override the _credit function to add custom logic
     * @param _to The address to credit tokens to
     * @param _amountLD The amount of tokens to credit in local decimals
     * @param _srcEid The source chain ID
     * @return amountReceivedLD The amount of tokens ACTUALLY received in local decimals
     */
    function _credit(
        address _to,
        uint256 _amountLD,
        uint32 _srcEid
    ) internal virtual override returns (uint256) {
        // Call parent _credit function
        uint256 amountReceivedLD = super._credit(_to, _amountLD, _srcEid);
        
        // Emit mint event
        emit PYUSDMinted(_to, amountReceivedLD);
        
        return amountReceivedLD;
    }
    
    /**
     * @dev Get token decimals
     * @return The number of decimals for PYUSD (6)
     */
    function decimals() public pure override returns (uint8) {
        return 6; // PYUSD has 6 decimals
    }
    
    /**
     * @dev Emergency function to mint tokens (only owner)
     * @param _to The address to mint tokens to
     * @param _amount The amount of tokens to mint
     */
    function emergencyMint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
        emit PYUSDMinted(_to, _amount);
    }
    
    /**
     * @dev Emergency function to burn tokens (only owner)
     * @param _from The address to burn tokens from
     * @param _amount The amount of tokens to burn
     */
    function emergencyBurn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
        emit PYUSDBurned(_from, _amount);
    }
}
