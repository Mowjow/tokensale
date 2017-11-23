pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PrisingStrategy.sol";

contract  EarlyContribStrategy { 
    using SafeMath for uint256;
 
    uint256 public rate;
    uint256 public totalSoldTokens = 0;  
    uint256 bonus;
    uint256 maxCap; 

    //events for testing 
    event TokenForEarlyContributors(uint256 _token, uint256 _tokenAndBonus, uint256 _bonusRate); 

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function EarlyContribStrategy(uint256 _bonus, uint _maxCap) { 
        bonus = _bonus;
        maxCap = _maxCap;        
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
        require(getFreeTokensInTranche(tokens)); 

        // calculate bonus 
        uint256 bonusToken = tokens.mul(bonus).div(100); 
        
        // total tokens amount to be created
        tokensAndBonus = tokens.add(bonusToken);
         
        TokenForEarlyContributors(tokens, tokensAndBonus, rate); 
        return tokensAndBonus; 
    }  

    /*
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) { 
        uint256 totalTokensForSale = maxCap.mul(rate);
        require((totalTokensForSale - totalSoldTokens) > requiredTokens);
        return true;
    } 
     
    /*
    * @dev summing sold of tokens  
    */ 
    function soldInTranche(uint256 tokensAndBonus) public {
        totalSoldTokens += tokensAndBonus;
    }  
}
