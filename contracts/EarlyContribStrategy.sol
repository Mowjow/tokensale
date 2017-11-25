pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PricingStrategy.sol";

contract  EarlyContribStrategy is PricingStrategy {
    using SafeMath for uint256;
 
    uint256 public rate;
    uint256 public totalSoldTokens;
    uint256 bonus;
    uint256 maxCap;

    event TokenForEarlyContributors(uint256 _token, uint256 _tokenAndBonus, uint256 _bonusRate);

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function EarlyContribStrategy(uint256 _bonus, uint _maxCap, uint _rate) public {
        bonus = _bonus;
        maxCap = _maxCap;
        rate = _rate;
        totalSoldTokens = 0;
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
        bool isFree = getFreeTokensInTranche(tokens);
        require(isFree);

        uint256 bonusToken = tokens.mul(bonus).div(100);

        tokensAndBonus = tokens.add(bonusToken);
        soldInTranche(tokensAndBonus);

        return tokensAndBonus; 
    }

    /*
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) { 
        uint256 totalTokensForSale = maxCap.mul(rate);
        uint256 remainingTokens = totalTokensForSale - totalSoldTokens;
        require(remainingTokens > requiredTokens);
        return true;
    }

    /*
    * @dev Amount of sold tokens
    */
    function soldInTranche(uint256 tokensAndBonus) public {
        totalSoldTokens += tokensAndBonus;
    }  
}
