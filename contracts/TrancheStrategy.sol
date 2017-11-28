pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PricingStrategy.sol";


contract  TrancheStrategy is PricingStrategy, Ownable {
    using SafeMath for uint256;

    uint256 public rate;
    uint256 public totalSoldTokens = 0;

    /*
    * Define bonus schedule of tranches.
    */
    struct BonusSchedule {

        //rate of bonus for current of transhe
        uint256 bonus;

        //Value of tokens avalible the current period
        uint valueForTranche;

        uint rate;
    }

    //events for testing
    event trancheSet(uint256 _tokenForTranchePeriod, uint256 _bonusForTranchePeriod);
    event AvailableTokens(uint256 freeTokens, uint256 requireTokens, bool hasTokensForSale);
    event TokenForInvestor(uint256 _token, uint256 _tokenAndBonus, uint256 indexOfperiod, uint256 bonusRate);
    event tokensSoldInTranche(uint256 _tokenForTranchePeriod, uint256 _tokenBonusForTranchePeriod, uint256 _bonusForTranchePeriod);

    mapping (uint256 => uint256) public tokenSoldInPeriod;
    uint MAX_TRANCHES = 50;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[] public tranches; 

    /*
    * @dev Constructor
    * @return uint256 Return rate of bonus for an investor
    */
    function TrancheStrategy(uint256[] _bonuses, uint[] _valueForTranches, uint[] _rates) {
       require(setTranche(_bonuses, _valueForTranches, _rates));
    }

    /*
    * @dev set parameters from the crowdsale 
    * @return uint256 Return rate of bonus for an investor
    */
    function setRate(uint256 _rate) public onlyOwner {
        rate = _rate;
    }

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus) {
        uint indexOfTranche = defineTranchePeriod();
        if(indexOfTranche == (MAX_TRANCHES + 1)) {
            throw;
        }
        require(indexOfTranche != MAX_TRANCHES + 1);

        BonusSchedule currentTranche = tranches[indexOfTranche];

        uint256 etherInWei = 1e18;
        require(_value >= etherInWei.div(currentTranche.rate));

        uint256 bonusRate = currentTranche.bonus;

        // calculate token amount without bonus
        uint256 tokens = _value.div(1e18).mul(currentTranche.rate);
        uint256 bonusToken = tokens.mul(bonusRate).div(100);

        tokensAndBonus = tokens.add(bonusToken);

        soldInTranche(tokensAndBonus);

        require(getFreeTokensInTranche(tokens));
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
        hasTokens = tranches[indexOfTranche].valueForTranche > requiredTokens;

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
    * @dev Sum of sold tokens
    */
    function soldInTranche(uint256 tokensAndBonus) public {
        uint256 indexOfTranche = defineTranchePeriod();

        require(tranches[indexOfTranche].valueForTranche >= tokensAndBonus);
        tranches[indexOfTranche].valueForTranche.sub(tokensAndBonus);
        totalSoldTokens.add(tokensAndBonus);
    }

    function getUnsoldInTranche() {
        uint256 indexOfTranche = defineTranchePeriod();
    }

    function isNoEmptyTranches() public returns(bool) {
        uint256 sumFreeTokens = 0;
        for (uint i = 0; i < tranches.length; i++) {
            sumFreeTokens.add(tranches[i].valueForTranche);
        }
        bool isValid = sumFreeTokens > 0 && now <= endTime;
        return isValid;
    }

    /*
    * @dev set parameters of a tranche 
    * @return true if succeful setting a tranche
    */ 
    function setTranche(uint256[] _bonuses, uint[] _valueForTranches, uint[] _rates) public returns(bool) {
        bool canSet = _bonuses.length == _valueForTranches.length && _valueForTranches.length == _rates.length;

        bool isSetable = canSet && _bonuses.length <= 50;

        if (isSetable) {
            for (uint i = 0; i < _bonuses.length; i++) {
                tranches.push(BonusSchedule({
                    bonus: _bonuses[i],
                    valueForTranche: _valueForTranches[i],
                    rate: _rates[i]
                }));
            }
        }

        return isSetable;
    }

    // /
    // * @dev get index of tranche  
    // * @return uint256 number of current tranche in array tranches
    // */ 
    function defineTranchePeriod() internal constant returns (uint256) {
        for (uint256 i = 0; i < tranches.length; i++) {
            if (tranches[i].valueForTranche > 0) {
                return i;
            }
        }

        return MAX_TRANCHES + 1;
    }

    /**
    * @dev Check working tranche
    * @return true if a tranche is set
    */ 
    function isTrancheSet() internal constant returns (bool) {
        return true; 
    }
}
