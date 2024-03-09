// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC20Token.sol";


contract ETHBridge is AccessControl {
    event ReceiveETH(address indexed sender, uint256 value);
    event ReceiveWFLR(address indexed sender, uint256 value);
    event ReceiveERC(address indexed sender, uint256 value);
    event ReleaseETH(address indexed receiver, uint256 value);
    event ReleaseWFLR(address indexed receiver, uint256 value);
    event ReleaseERC(address indexed receiver, uint256 value);

    bytes32 public constant EVENT_LISTENER_ROLE = keccak256("EVENT_LISTENER_ROLE");

    ERC20Token public wFLRToken;
    ERC20Token public ERCToken;

    constructor(
        address _eventListener,
        address _wFLR,
        address _ERC
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EVENT_LISTENER_ROLE, _eventListener);
        wFLRToken = ERC20Token(_wFLR);
        ERCToken = ERC20Token(_ERC);
    }

    function bridgeETH(uint256 _amount) payable external {
        require(msg.value == _amount, "ETHBridge: invalid amount");
        emit ReceiveETH(msg.sender, _amount);
    }

    function bridgeWFLR(uint256 _amount) external {
        wFLRToken.transferFrom(msg.sender, address(this), _amount);
        wFLRToken.burn(_amount);
        emit ReceiveWFLR(msg.sender, _amount);
    }

    function bridgeERC(uint256 _amount) external {
        ERCToken.transferFrom(msg.sender, address(this), _amount);
        ERCToken.burn(_amount);
        emit ReceiveERC(msg.sender, _amount);
    }

    function releaseETH(address _receiver, uint256 _amount) external onlyRole(EVENT_LISTENER_ROLE) {
        require (address(this).balance >= _amount, "ETHBridge: insufficient balance");
        (bool success, ) = _receiver.call{value: _amount}("");
        require(success, "ETHBridge: failed to send ETH");
        emit ReleaseETH(_receiver, _amount);
    }

    function releaseWFLR(address _receiver, uint256 _amount) external onlyRole(EVENT_LISTENER_ROLE) {
        wFLRToken.mint(_receiver, _amount);
        emit ReleaseWFLR(_receiver, _amount);
    }

    function releaseERC(address _receiver, uint256 _amount) external onlyRole(EVENT_LISTENER_ROLE) {
        ERCToken.mint(_receiver, _amount);
        emit ReleaseERC(_receiver, _amount);
    }
}