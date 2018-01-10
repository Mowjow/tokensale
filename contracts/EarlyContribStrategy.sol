pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PricingStrategy.sol";


/**
* @title EarlyContribStrategy
* @dev Pricing strategy for early contributors *
*/
contract  EarlyContribStrategy is PricingStrategy {
    using SafeMath for uint256;

    uint256 public rate;
    uint256 bonus;
    uint256 maxCap;

    /*
    * @dev Constructor
    * MAX CAP IN TOKENS ETC
    */
    function EarlyContribStrategy(uint256 _bonus, uint256 _maxCap, uint256 _rate) public {
        bonus = _bonus;
        maxCap = _maxCap;
        rate = _rate;
    }

    /*
    * @dev Count number of tokens with bonuses
    * @return uint256 Return number of tokens for an investor
    */
    function countTokens(uint256 _value) public onlyCrowdsale returns (uint256 tokensAndBonus) {
        uint256 etherInWei = 1e18;
        uint256 val = _value.mul(etherInWei);
        uint256 oneTokenInWei = etherInWei.div(rate);
        uint256 tokens = val.div(oneTokenInWei);
        uint256 bonusToken = tokens.mul(bonus).div(100);

        tokensAndBonus = tokens.add(bonusToken);
        getFreeTokensInTranche(tokensAndBonus);
        soldInTranche(tokensAndBonus);
        return tokensAndBonus;
    }

    /*
    * @dev Check required of tokens in the tranche
    * @param _requiredTokens uint256 Number of tokens
    * @return boolean Return true if count of tokens is available
    */
    function getFreeTokensInTranche(uint256 _requiredTokens) internal constant returns (bool){
        uint256 remainingTokens = maxCap.sub(totalSoldTokens);
        require(remainingTokens > _requiredTokens);
    }

    function isNoEmptyTranches() public constant returns(bool) {
    }

    /*
    * @dev Summing sold of tokens
    * @param _tokensAndBonus uint256 Number tokens for current sale in a tranche
    */
    function soldInTranche(uint256 _tokensAndBonus) internal {
        totalSoldTokens = totalSoldTokens.add(_tokensAndBonus);
    }
}
