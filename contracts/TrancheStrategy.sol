pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PrisingStrategy.sol";

contract  TrancheStrategy is PrisingStrategy, Ownable { 
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public rate;
    uint256 public totalSaleTokens = 0;
    // uint public daysOfTranches;
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

    //BonusSchedule[] memory tranches;
    /*
    * For testing purposes 
    */
    uint256 public maxCountTokensForSaleInPeriod = 4 * 1e8;

    event trancheSet(uint _daysOfTranche, uint256 _tokenForTranchePeriod, uint256 _bonusForTranchePeriod);
    event TokenForInvestor(uint256 _token, uint256 _tokenAndBonus, uint256 indexOfperiod, uint256 bonus, uint256 currentTime);
    event tokensSoldInTranche(uint256 _tokenForTranchePeriod, uint256 _tokenBonusForTranchePeriod, uint256 _bonusForTranchePeriod);

    mapping (uint256 => uint256) public tokenSoldInPeriod;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[] public tranches; 

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function TrancheStrategy(uint[] _daysOfTranches, uint256[] _bonuses, uint[] _valueForTranches) { 
       require(setTranche(_daysOfTranches, _bonuses, _valueForTranches));
    }   

    /*
    * @dev set parameters from the crowdsale 
    * @return uint256 Return rate of bonus for an investor
    */
    function setParams(uint256 _startTime, uint256 _rate) public {
        startTime = _startTime;
        rate = _rate;
    } 

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus) {
        require(startTime <= now);
        uint indexOfTranche = defineTranchePeriod();
        uint256 bonusRate = tranches[indexOfTranche].bonus;   

        // calculate token amount without bonus
        uint256 tokens = _value.mul(rate); 
        //require(getFreeTokensInTranche(tokens)); 

        // calculate bonus 
        uint256 bonusToken = tokens.mul(bonusRate).div(100); 
        
        // total tokens amount to be created
        tokensAndBonus = tokens.add(bonusToken);  
        TokenForInvestor(tokens, tokensAndBonus, indexOfTranche, bonusRate, now); 
        return tokensAndBonus; 
    }  

    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) {
        uint indexOfTranche = defineTranchePeriod();
        require(tranches[indexOfTranche].valueForTranche > requiredTokens);
        return true;
    }

    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function addTokensSoldInTranche(uint256 tokensAndBonus) public {
        totalSaleTokens += tokensAndBonus;
    }

    /**
    * @dev set parameters of a tranche 
    * @return true if succeful tranche
    */ 
    function setTranche(uint[] _daysOfTranches, uint256[] _bonuses, uint[] _valueForTranches) public returns(bool) {
        if (_daysOfTranches.length == _bonuses.length && _bonuses.length == _valueForTranches.length) {
            for (uint i = 0; i < _daysOfTranches.length; i++) { 
                tranches.push(BonusSchedule({daysAfterStart: _daysOfTranches[i] * 1 days, bonus: _bonuses[i], valueForTranche: _valueForTranches[i]}));
            }
        }
        if (tranches.length == _daysOfTranches.length) {
            return true;
        } else {
            return false;
        }  
    } 

    /**
    * @dev Check  
    * @return true if the transaction can buy tokens
    */ 
    function defineTranchePeriod() internal constant returns (uint256 indexOfTranche) {
        for (uint i = 0; i < tranches.length; i++) {
            if ((startTime + tranches[i].daysAfterStart) >= now) {
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
