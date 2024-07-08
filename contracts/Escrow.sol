// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Escrow {

    address public arbiter;
    address public beneficiary;
    address public depositor;

    bool public isApproved;

    event Approved(uint);

    constructor(address _arbiter, address _beneficiary) payable {
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        depositor = msg.sender;
    }

    function approve() external {
        require(msg.sender == arbiter);
        uint balance = address(this).balance;
        (bool s, ) = payable(beneficiary).call{value: balance}("");
        require(s, "Failed to send ether");
        emit Approved(balance);
    }
}