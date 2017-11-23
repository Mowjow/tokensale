pragma solidity ^0.4.11;  

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PrisingStrategy.sol";


contract  TrancheStrategy is PrisingStrategy, Ownable { 
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public rate;
    uint256 public totalSoldTokens = 0;
    // uint public daysOfTranches;

    /*
    * Define bonus schedule of tranches.
    */
    struct BonusSchedule {

        //rate of bonus for current of transhe
        uint256 bonus;

        //Value of tokens avalible the current period
        uint valueForTranche;
    }  

    //events for testing
    event trancheSet(uint256 _tokenForTranchePeriod, uint256 _bonusForTranchePeriod);
    event AvalibleTokens(uint256 freeTokens, uint256 requireTokens, bool hasTokensForSale);
    event TokenForInvestor(uint256 _token, uint256 _tokenAndBonus, uint256 indexOfperiod, uint256 bonusRate);
    event tokensSoldInTranche(uint256 _tokenForTranchePeriod, uint256 _tokenBonusForTranchePeriod, uint256 _bonusForTranchePeriod);

    mapping (uint256 => uint256) public tokenSoldInPeriod;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[] public tranches; 

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function TrancheStrategy(uint256[] _bonuses, uint[] _valueForTranches) { 
       require(setTranche(_bonuses, _valueForTranches));
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
        uint indexOfTranche = defineTranchePeriod();
         
        uint256 bonusRate = tranches[indexOfTranche].bonus;   
        //TokenForInvestor(_value, tokensAndBonus, indexOfTranche, bonusRate);
        // calculate token amount without bonus
        uint256 tokens = _value.mul(rate); 
        //require(getFreeTokensInTranche(tokens)); 

        // calculate bonus 
        uint256 bonusToken = tokens.mul(bonusRate).div(100); 
        
        // total tokens amount to be created
        tokensAndBonus = tokens.add(bonusToken);  
        TokenForInvestor(tokens, tokensAndBonus, indexOfTranche, bonusRate); 
        return tokensAndBonus; 
    }  

    /*
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) {
        bool hasTokens = false;
        uint256 indexOfTranche = defineTranchePeriod(); 
        if (tranches[indexOfTranche].valueForTranche > requiredTokens) { 
            hasTokens = true;
            
        } else {
            hasTokens = false;
        }   
        AvalibleTokens(tranches[indexOfTranche].valueForTranche, requiredTokens, hasTokens);     
        return hasTokens;
    }

    /*
    * @dev set parameters of a tranche 
    * @return uint256 sum 
    */ 
    function countRemainingTokens() public returns (uint256 remainingTokens) {
        for (uint i = 0; i < tranches.length; i++) {
            remainingTokens += tranches[i].valueForTranche;
        }
        return remainingTokens;
    }

    /*
    * @dev summing sold of tokens  
    */ 
    function soldInTranche(uint256 tokensAndBonus) public {
        uint256 indexOfTranche = defineTranchePeriod();
        require(tranches[indexOfTranche].valueForTranche >= tokensAndBonus);
        tranches[indexOfTranche].valueForTranche.sub(tokensAndBonus); 
        totalSoldTokens.add(tokensAndBonus);
    } 

    function isNoEmptyTranches() public returns(bool) {
        uint256 sumFreeTokens = 0;
        for (uint i = 0; i < tranches.length; i++) {
            sumFreeTokens.add(tranches[i].valueForTranche);
        }
        if (sumFreeTokens > 0) {
            return true;
        } else {
            return false;
        }
    }

    /*
    * @dev set parameters of a tranche 
    * @return true if succeful setting a tranche
    */ 
    function setTranche(uint256[] _bonuses, uint[] _valueForTranches) public returns(bool) {
        if (_bonuses.length == _valueForTranches.length) {
            for (uint i = 0; i < _bonuses.length; i++) { 
                tranches.push(BonusSchedule({bonus: _bonuses[i], valueForTranche: _valueForTranches[i]}));
            }
        }
        if (tranches.length == _bonuses.length) {
            return true;
        } else {
            return false;
        }  
    } 

    // /
    // * @dev get index of tranche  
    // * @return uint256 number of current tranche in array tranches
    // */ 
    function defineTranchePeriod() internal constant returns (uint256 indexOfTranche) {
        indexOfTranche = 0;
        for (uint256 i = 0; i < tranches.length; i++) { 
            if (tranches[i].valueForTranche > 0) {
                return i; 
            }            
        } 
    } 

    /**
    * @dev Check working tranche
    * @return true if a tranche is set
    */ 
    function isTrancheSet() internal constant returns (bool) {
        return true; 
    } 
}
