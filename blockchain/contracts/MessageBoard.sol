// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageBoard {
    struct Message {
        address sender;
        string device_id;
        string firmware_version;
        string firmware_hash;
        uint256 timestamp;
    }
    
    Message[] private messages;
    
    event MessagePublished(
        address indexed sender,
        string device_id,
        string firmware_version,
        string firmware_hash,
        uint256 timestamp
    );
    
    function publish(
        string memory _device_id,
        string memory _firmware_version,
        string memory _firmware_hash
    ) public {
        Message memory newMessage = Message({
            sender: msg.sender,
            device_id: _device_id,
            firmware_version: _firmware_version,
            firmware_hash: _firmware_hash,
            timestamp: block.timestamp
        });
        
        messages.push(newMessage);
        emit MessagePublished(
            msg.sender,
            _device_id,
            _firmware_version,
            _firmware_hash,
            block.timestamp
        );
    }
    
    function fetch() public view returns (Message[] memory) {
        return messages;
    }
    
    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }
}
