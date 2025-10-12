// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {OFTAdapter} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFTAdapter.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PYUSDOFTAdapter
 * @dev PYUSD token adapter for LayerZero cross-chain transfers
 * This contract allows PYUSD tokens to be bridged from Ethereum Sepolia to Hedera Testnet
 */
contract PYUSDOFTAdapter is OFTAdapter {
    
    event PYUSDBridged(address indexed from, address indexed to, uint256 amount, uint32 dstEid);
    
    constructor(
        address _token,        // PYUSD token address on Ethereum Sepolia
        address _lzEndpoint,  // LayerZero endpoint address
        address _owner        // Contract owner
    ) OFTAdapter(_token, _lzEndpoint, _owner) Ownable(_owner) {}
    
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
        
        // Emit custom event for PYUSD bridging
        emit PYUSDBridged(_from, _from, amountSentLD, _dstEid);
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
        
        // Emit custom event for PYUSD bridging
        emit PYUSDBridged(address(0), _to, amountReceivedLD, _srcEid);
        
        return amountReceivedLD;
    }
    
    /**
     * @dev Get the token address
     * @return The address of the underlying PYUSD token
     */
    function getTokenAddress() external view returns (address) {
        return token();
    }
    
    /**
     * @dev Get token decimals
     * @return The number of decimals for PYUSD (6)
     */
    function getTokenDecimals() external pure returns (uint8) {
        return 6; // PYUSD has 6 decimals
    }
}
