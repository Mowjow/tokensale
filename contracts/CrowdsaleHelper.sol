pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/*
*  @title CrowdsaleHelper
*  Contract for manage methods from Mowjow crowdsale only.
*/
contract CrowdsaleHelper is Ownable {

    address crowdsale;

    modifier onlyCrowdsale {
        require(crowdsale == msg.sender);
        _;
    }

    function setCrowdsaleAddress(address _crowdsale) public onlyOwner {
        crowdsale = _crowdsale;
    }
}
