pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PricingStrategy.sol";

contract  PreIcoStrategy is PricingStrategy {
    using SafeMath for uint256;

    uint256 public rate;
    uint256 public totalPreIcoSoldTokens = 0;  
    uint256 bonus;
    uint256 maxCap;

    //events for testing  
    event TokensForWhiteListInvestors(uint256 _token, uint256 _tokenAndBonus, uint256 bonusRate);

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function PreIcoStrategy(uint256 _bonus, uint _maxCap, uint256 _rate) {
        bonus = _bonus;
        maxCap = _maxCap;
        rate = _rate;
    }

    /*
    * @dev set parameters from the crowdsale 
    * @return uint256 Return rate of bonus for an investor
    */
    function setRate(uint256 _rate) public { 
        rate = _rate;
    }

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus) {   
         
        uint256 tokens = _value.mul(rate);
        uint256 bonusToken = tokens.mul(bonus).div(100);
        tokensAndBonus = tokens.add(bonusToken);

        require(getFreeTokensInTranche(tokens));

        TokensForWhiteListInvestors(tokens, tokensAndBonus, rate);
        return tokensAndBonus;
    }  

    /*
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) {
        return (maxCap - totalPreIcoSoldTokens) > 0;
    } 

    function getNotSoldTokens() public returns (uint256) {      
        return maxCap - totalPreIcoSoldTokens;
    }

    function isNoEmptyPreIcoTranche() public returns (bool) {
        uint availableTokens = maxCap - totalPreIcoSoldTokens;
        return availableTokens > 0 || now <= endTime;
    }
     
    /*
    * @dev summing sold of tokens  
    */ 
    function soldInTranche(uint256 tokensAndBonus) public {
        totalPreIcoSoldTokens += tokensAndBonus;
    }
}
