pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PricingStrategy.sol";


/**
* @title TrancheStrategy
* @dev Pricing strategy for investors in the crowdsale time
*/
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

        //Value of tokens avalable the current period
        uint valueForTranche;

        uint rate;
    }

    //events for testing
    event TokenForInvestor(uint256 _token, uint256 _tokenAndBonus, uint256 indexOfperiod, uint256 bonusRate);

    mapping (uint256 => uint256) public tokenSoldInPeriod;
    uint MAX_TRANCHES = 50;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[] public tranches; 

    /*
    * @dev Constructor
    * @param _bonuses uint256[] Bonuses in tranches
    * @param _bonuses uint256[] Bonuses in tranches
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
    * @dev Count number of tokens with bonuses
    * @return uint256 Return number of tokens for an investor
    */
    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus) {
        uint indexOfTranche = defineTranchePeriod();
        require(indexOfTranche != MAX_TRANCHES + 1);

        BonusSchedule currentTranche = tranches[indexOfTranche];

        uint256 etherInWei = 1e18;
        require(_value >= etherInWei.div(currentTranche.rate));

        uint256 bonusRate = currentTranche.bonus;

        uint256 tokens = _value.div(1e18).mul(currentTranche.rate);
        uint256 bonusToken = tokens.mul(bonusRate).div(100);

        tokensAndBonus = tokens.add(bonusToken);

        soldInTranche(tokensAndBonus);
        TokenForInvestor(tokens, tokensAndBonus, indexOfTranche, bonusRate);
        return tokensAndBonus;

        return 0;
    }

     /*
     * @dev Check required of tokens in the tranche
     * @return true if count of tokens is available
     */
    function getFreeTokensInTranche(uint256 requiredTokens) public returns (bool) {
        bool hasTokens = false;
        uint256 indexOfTranche = defineTranchePeriod();
        hasTokens = tranches[indexOfTranche].valueForTranche > requiredTokens;

        return hasTokens;
    }

    /*
    * @dev Summing sold of tokens
    */
    function soldInTranche(uint256 tokensAndBonus) public {
        uint256 indexOfTranche = defineTranchePeriod();
        require(tranches[indexOfTranche].valueForTranche >= tokensAndBonus);
        tranches[indexOfTranche].valueForTranche = tranches[indexOfTranche].valueForTranche.sub(tokensAndBonus);
        totalSoldTokens.add(tokensAndBonus);
    }

    /*
    * @dev Check sum of the tokens for sale in the tranches in the crowdsale time
    */
    function isNoEmptyTranches() public returns(bool) {
        uint256 sumFreeTokens = 0;
        for (uint i = 0; i < tranches.length; i++) {
            sumFreeTokens = sumFreeTokens.add(tranches[i].valueForTranche);
        }
        bool isValid = sumFreeTokens > 0 && now <= endTime;
        return isValid;
    }

    /*
    * @dev set parameters of a tranche 
    * @return true if successful setting a tranche
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
