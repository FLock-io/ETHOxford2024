// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC20Token.sol";


contract FLRBridge is AccessControl {
    event ReceiveWETH(address indexed sender, uint256 value);
    event ReceiveFLR(address indexed sender, uint256 value);
    event ReceiveERC(address indexed sender, uint256 value);
    event ReleaseWETH(address indexed receiver, uint256 value);
    event ReleaseFLR(address indexed receiver, uint256 value);
    event ReleaseERC(address indexed receiver, uint256 value);

    bytes32 public constant EVENT_LISTENER_ROLE = keccak256("EVENT_LISTENER_ROLE");

    ERC20Token public wETHToken;
    ERC20Token public ERCToken;

    constructor(
        address _eventListener,
        address _wETH,
        address _ERC
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EVENT_LISTENER_ROLE, _eventListener);
        wETHToken = ERC20Token(_wETH);
        ERCToken = ERC20Token(_ERC);
    }

    function bridgeFLR(uint256 _amount, uint256 _fee) payable external {
        require(msg.value == _amount + _fee, "FLRBridge: invalid amount");
        emit ReceiveFLR(msg.sender, _amount);
    }

    function bridgeWETH(uint256 _amount, uint256 _fee) payable external {
        require(msg.value == _fee, "FLRBridge: invalid fee");
        wETHToken.transferFrom(msg.sender, address(this), _amount);
        wETHToken.burn(_amount);
        // Replace both with .burnFrom()
        emit ReceiveWETH(msg.sender, _amount);
    }

    function bridgeERC(uint256 _amount, uint256 _fee) payable external {
        require(msg.value == _fee, "FLRBridge: invalid fee");
        ERCToken.transferFrom(msg.sender, address(this), _amount);
        ERCToken.burn(_amount);
        emit ReceiveERC(msg.sender, _amount);
    }

    function releaseFLR(address _receiver, uint256 _amount) external onlyRole(EVENT_LISTENER_ROLE) {
        require (address(this).balance >= _amount, "ETHBridge: insufficient balance");
        (bool success, ) = _receiver.call{value: _amount}("");
        require(success, "FLRBridge: failed to send ETH");
        emit ReleaseFLR(_receiver, _amount);
    }

    function releaseWETH(address _receiver, uint256 _amount) external onlyRole(EVENT_LISTENER_ROLE) {
        wETHToken.mint(_receiver, _amount);
        emit ReleaseWETH(_receiver, _amount);
    }

    function releaseERC(address _receiver, uint256 _amount) external onlyRole(EVENT_LISTENER_ROLE) {
        ERCToken.mint(_receiver, _amount);
        emit ReleaseERC(_receiver, _amount);
    }

    function withdrawFLR() external onlyRole(EVENT_LISTENER_ROLE) {
        require(address(this).balance > 0, "FLRBridge: insufficient balance");
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "FLRBridge: failed to send ETH");
    }
}