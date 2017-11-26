pragma solidity ^0.4.11;

//import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract PricingStrategy {
    uint public endTime;

    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus);
    function soldInTranche(uint256 tokensAndBonus) public;

    function setEndDate(uint _endTime) {
        endTime = _endTime;
    }
}
