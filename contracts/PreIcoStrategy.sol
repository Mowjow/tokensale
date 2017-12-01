pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PricingStrategy.sol";


contract  PreIcoStrategy is PricingStrategy {
    using SafeMath for uint256;

    uint256 public rate;
    uint256 public totalPreIcoSoldTokens;
    uint256 bonus;
    uint256 public maxCap;


    /*
    * @dev Constructor
    */
    function PreIcoStrategy(uint256 _bonus, uint _maxCap, uint256 _rate) {
        bonus = _bonus;
        maxCap = _maxCap;
        rate = _rate;
        totalPreIcoSoldTokens = 0;
    }

    /*
    * @dev set parameters from the crowdsale 
    * @return uint256 Return rate of bonus for an investor
    */
    function setRate(uint256 _rate) public {
        rate = _rate;
    }
    event TokensAndBonus(uint256, uint256, uint256);

    /*
    * @dev Count number of tokens with bonuses
    * @return uint256 Return number of tokens for an investor
    */
    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus) {
        uint256 etherInWei = 1e18;
        require(_value >= etherInWei.div(rate));

        uint256 tokens = _value.div(1e18).mul(rate);
        uint256 bonusToken = (tokens).mul(bonus).div(100);

        uint256 freeTokens = getUnSoldTokens();
        tokensAndBonus = tokens.add(bonusToken);

        if(freeTokens >= tokensAndBonus) {
            soldInTranche(tokensAndBonus);
        } else {
            require(false);
        }

        return tokensAndBonus;
    }

    /*
    * @dev Check required of tokens in the tranche
    * @return true if count of tokens is available
    */
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) {
        return (maxCap - totalPreIcoSoldTokens) >= requiredTokens;
    } 

    function getUnSoldTokens() public returns (uint256) {
        return maxCap - totalPreIcoSoldTokens;
    }

    function isNoEmptyPreIcoTranche() public returns (bool) {
        uint256 availableTokens = maxCap - totalPreIcoSoldTokens;
        return availableTokens > 0 && now <= endTime;
    }
     
    /*
    * @dev Summing sold of tokens
    */ 
    function soldInTranche(uint256 tokens) public {
        totalPreIcoSoldTokens = totalPreIcoSoldTokens.add(tokens);
    }
}
