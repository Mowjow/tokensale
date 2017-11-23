pragma solidity ^0.4.11; 


import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PrisingStrategy.sol";


contract  PreIcoStrategy { 
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public rate;
    uint256 public totalPreIcoSoldTokens = 0;  
    uint256 bonus;
    uint256 maxCap;
    uint256 totalTokensForSale; 

    //events for testing  
    event TokensForWhiteListInvestors(uint256 _token, uint256 _tokenAndBonus, uint256 bonusRate); 
    event SoldTokensForWhiteListInvestors(uint256 soldTokensForPreIcoInvestor, uint256 totalPreIcoSoldTokens, uint256 totalPreIcoTokens);   

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function PreIcoStrategy(uint256 _bonus, uint _maxCap) { 
        bonus = _bonus;
        maxCap = _maxCap;        
    }   

    /*
    * @dev set parameters from the crowdsale 
    * @return uint256 Return rate of bonus for an investor
    */
    function setRate(uint256 _rate) public { 
        rate = _rate;
        totalTokensForSale = maxCap.mul(rate);
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
         
        TokensForWhiteListInvestors(tokens, tokensAndBonus, rate); 
        return tokensAndBonus; 
    }  

    /*
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) { 
        require((totalTokensForSale - totalPreIcoSoldTokens) > requiredTokens);
        return true;
    } 

    function getNotSoldTokens() public returns (uint256) {         
        return totalTokensForSale;
    }

    function isNoEmptyPreIcoTranche() public returns (bool) {
        if ((totalTokensForSale - totalPreIcoSoldTokens) > 0) {
            return true;
        } else {
            return false;
        }
    }
     
    /*
    * @dev summing sold of tokens  
    */ 
    function soldInTranche(uint256 tokensAndBonus) public {
        totalPreIcoSoldTokens += tokensAndBonus;
        SoldTokensForWhiteListInvestors(tokensAndBonus, totalPreIcoSoldTokens, totalPreIcoSoldTokens); 
    }  
}
