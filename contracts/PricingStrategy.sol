pragma solidity ^0.4.11;

contract PricingStrategy {

    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus);
    function soldInTranche(uint256 tokensAndBonus) public;
}
