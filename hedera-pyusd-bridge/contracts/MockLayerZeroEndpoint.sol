// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title MockLayerZeroEndpoint
 * @dev Mock LayerZero endpoint for testing purposes
 */
contract MockLayerZeroEndpoint {
    mapping(uint32 => mapping(bytes32 => bool)) public trustedRemoteLookup;
    mapping(uint32 => mapping(bytes32 => uint256)) public defaultSendLibrary;
    mapping(uint32 => mapping(bytes32 => uint256)) public defaultReceiveLibrary;
    
    function setTrustedRemote(uint32 _srcEid, bytes calldata _path) external {
        trustedRemoteLookup[_srcEid][keccak256(_path)] = true;
    }
    
    function isTrustedRemote(uint32 _srcEid, bytes calldata _path) external view returns (bool) {
        return trustedRemoteLookup[_srcEid][keccak256(_path)];
    }
    
    function setDefaultSendLibrary(uint32 _eid, bytes calldata _lib) external {
        defaultSendLibrary[_eid][keccak256(_lib)] = 1;
    }
    
    function setDefaultReceiveLibrary(uint32 _eid, bytes calldata _lib) external {
        defaultReceiveLibrary[_eid][keccak256(_lib)] = 1;
    }
    
    function getDefaultSendLibrary(uint32 _eid) external view returns (address) {
        return address(this);
    }
    
    function getDefaultReceiveLibrary(uint32 _eid) external view returns (address) {
        return address(this);
    }
    
    // Fallback function to handle unrecognized selectors
    fallback() external payable {
        // Do nothing, just accept the call
    }
    
    receive() external payable {
        // Accept ETH
    }
}
