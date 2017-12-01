pragma solidity ^0.4.11;


contract PricingStrategy {
    uint public endTime;

    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus);
    function soldInTranche(uint256 tokensAndBonus) public;
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool);

    function setEndDate(uint _endTime) {
        endTime = _endTime;
    }
}
