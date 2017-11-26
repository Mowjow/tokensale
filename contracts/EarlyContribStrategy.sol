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
    * // MAX CAP IN TOKENS ETC
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

    event Test(bool);
    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countTokens(uint256 _value) public returns (uint256) {

        uint256 tokens = _value.mul(rate);
        uint256 bonusToken = tokens.mul(bonus).div(100);

        uint256 totalTokens = tokens.add(bonusToken);

        getFreeTokensInTranche(totalTokens);

        return totalTokens;
    }

    /*
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public {
        uint256 remainingTokens = maxCap - totalSoldTokens;
        require(remainingTokens > requiredTokens);
    }

    /*
    * @dev Amount of sold tokens
    */
    function soldInTranche(uint256 tokensAndBonus) public {
        totalSoldTokens += tokensAndBonus;
    }
}
