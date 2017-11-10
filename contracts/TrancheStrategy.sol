pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PrisingStrategy.sol";

contract  TrancheStrategy is  Ownable, PrisingStrategy { 

    /**
    * Define bonus schedule of transhes.
    */
    struct BonusSchedule {

        //number of days after start the crowdsale 
        uint daysAfterStart;

        //rate of bonus for current of transhe
        uint256 bonus;

        //Value of tokens avalible the current period
        uint valueForTranche;
    } 

    uint256 public maxCountTokensForSaleInPeriod = 4 * 1e8;

    mapping (uint => uint256) public tokenSoldInPeriod;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[5] public transhes;
    uint countTranches = 0; 

    function setTranshesData() public {
        setTranche(0 days, maxCountTokensForSaleInPeriod, 50);
        setTranche(15 days, maxCountTokensForSaleInPeriod, 35);
        setTranche(30 days, maxCountTokensForSaleInPeriod, 20);
        setTranche(40 days, maxCountTokensForSaleInPeriod, 5);
        setTranche(50 days, maxCountTokensForSaleInPeriod, 0);        
    }  

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countBonus(uint256 startTime) public returns (uint256 bonus) {        
        for (uint i = 0; i < transhes.length - 1; i++) { 
            if ((startTime + transhes[i].daysAfterStart) >= now) {     
                return transhes[i].bonus;            
            }            
        }
    } 
  
    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function isNoOverSoldInCurrentTranche(uint newInvestValue, uint tokenSold) public  returns (bool) {
        uint tokenTotal = (newInvestValue + tokenSold);
        return tokenTotal > maxCountTokensForSaleInPeriod;
    }

    function getTokensSoldInTranche(uint timeStartIco) public returns (uint256 tokens) {
        uint indexOfTranche = defineTranchePeriod(timeStartIco);
        tokens = tokenSoldInPeriod[indexOfTranche];
        return tokens;
    }

    function addTokensSoldInTranche(uint timeStartIco, uint256 soldTokens) public {
        uint indexOfTranche = defineTranchePeriod(timeStartIco);
        tokenSoldInPeriod[indexOfTranche] += soldTokens;
    }

    function fillTranshesData(BonusSchedule newTranche) internal constant { 
        transhes[countTranches] = newTranche;
        countTranches++;
    }

    function defineTranchePeriod(uint timeStartIco) internal constant returns (uint indexOfTranche) {
        for (uint i = 0; i < transhes.length; i++) {

            if ((timeStartIco + transhes[i].daysAfterStart) >= now) {
               // currentTranchePeriod = transhes[i].period;           
                return i;
            }            
        }
    }

    function setTranche(uint _daysOfTranche, uint256 _tokenForTranchePeriod, uint256 _bonusForTranchePeriod) public onlyOwner {  
        transhes[countTranches] = BonusSchedule({daysAfterStart: _daysOfTranche, bonus: _bonusForTranchePeriod, valueForTranche: _tokenForTranchePeriod});
        countTranches++;       
        daysOfTranches = _daysOfTranche;
        tokensForSale = _tokenForTranchePeriod;
        bonusRate = _bonusForTranchePeriod; 
    }

    function isTrancheSet(uint startTime) internal constant returns (bool) {  
        bool tranche = (daysOfTranches + startTime) > now;
        bool tokensFree = tokensForSale > 0;
        return tranche && tokensFree;
    } 

}
