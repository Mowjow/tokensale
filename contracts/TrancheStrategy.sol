pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PrisingStrategy.sol";

contract  TrancheStrategy is PrisingStrategy, Ownable { 
    uint256 public startTime;
    uint256 public bonusRate;
    uint256 public tokensForSale;
    uint public daysOfTranches;
    /**
    * Define bonus schedule of tranches.
    */
    struct BonusSchedule {

        //number of days after start the crowdsale 
        uint daysAfterStart;

        //rate of bonus for current of transhe
        uint256 bonus;

        //Value of tokens avalible the current period
        uint valueForTranche;
    } 

    /*
    * For testing purposes 
    */
    uint256 public maxCountTokensForSaleInPeriod = 4 * 1e8;

    event trancheSet(uint _daysOfTranche, uint256 _tokenForTranchePeriod, uint256 _bonusForTranchePeriod);

    event tokensSoldInTranche(uint256 _tokenForTranchePeriod, uint256 _tokenBonusForTranchePeriod, uint256 _bonusForTranchePeriod);

    mapping (uint256 => uint256) public tokenSoldInPeriod;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[] public tranches; 

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function TrancheStrategy() {
        setTranchesData();
    }

    /*
    * For testing purposes 
    */
    function setTranchesData() public {
        setTranche(0 days, maxCountTokensForSaleInPeriod, 50);
        setTranche(15 days, maxCountTokensForSaleInPeriod, 35);
        setTranche(30 days, maxCountTokensForSaleInPeriod, 20);
        setTranche(40 days, maxCountTokensForSaleInPeriod, 5);
        setTranche(50 days, maxCountTokensForSaleInPeriod, 0);        
    }


    function setStartTime(uint256 _startTime) public {
        startTime = _startTime;
    } 

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countBonus() public returns (uint256 bonus) {        
        for (uint i = 0; i < tranches.length; i++) { 
            if ((startTime + tranches[i].daysAfterStart) >= now) {     
                return tranches[i].bonus;            
            }            
        }  
    } 

    /*
    * @dev Count free tokens for sale in a tranche
    * @return  
    */
    function countMaxSoldToken() public returns (uint256) {        
        uint indexOfTranche = defineTranchePeriod();
        maxCountTokensForSaleInPeriod = maxCountTokensForSaleInPeriod - tokenSoldInPeriod[indexOfTranche];
        return maxCountTokensForSaleInPeriod;
    } 
  
    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function isNoOverSoldInCurrentTranche(uint newInvestValue) public  returns (bool) {
        uint indexOfTranche = defineTranchePeriod();
        uint tokens = tokenSoldInPeriod[indexOfTranche];
        uint tokenTotal = (newInvestValue + tokens);
        return tokenTotal > maxCountTokensForSaleInPeriod;
    }

    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getTokensSoldInTranche() public returns (uint256 tokens) {
        uint indexOfTranche = defineTranchePeriod();
        tokens = tokenSoldInPeriod[indexOfTranche];
        return tokens;
    }

    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function addTokensSoldInTranche(uint256 soldTokens, uint256 soldBonusTokens, uint256 bonusRate) public {
        uint indexOfTranche = defineTranchePeriod();
        tokenSoldInPeriod[indexOfTranche] += soldTokens;
        tokensSoldInTranche(soldTokens, soldBonusTokens, bonusRate);
    }

    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function defineTranchePeriod() internal constant returns (uint256 indexOfTranche) {
        for (uint i = 0; i < tranches.length; i++) {
            if ((startTime + tranches[i].daysAfterStart) >= now) {
                return tranches[i].bonus;  
            }            
        }
    }

    /**
    * @dev set parameters of a tranche 
    * @return true if succeful tranche
    */ 
    function setTranche(uint _daysOfTranche, uint256 _tokenForTranchePeriod, uint256 _bonusForTranchePeriod) public returns (bool) {
        tranches.push(BonusSchedule({daysAfterStart: _daysOfTranche, bonus: _bonusForTranchePeriod, valueForTranche: _tokenForTranchePeriod})); 
        trancheSet(_daysOfTranche, _tokenForTranchePeriod, _bonusForTranchePeriod);
        return true;
    }

    /**
    * @dev Check working tranche
    * @return true if is free tokens for sale
    */ 
    function isTrancheSet() internal constant returns (bool) {  
        bool tranche = (daysOfTranches + startTime) > now;
        bool tokensFree = tokensForSale > 0;
        return tranche && tokensFree;
    } 
}
