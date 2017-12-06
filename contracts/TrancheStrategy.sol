pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PricingStrategy.sol";


/**
* @title TrancheStrategy
* @dev Pricing strategy for investors in the crowdsale time
*/
contract  TrancheStrategy is PricingStrategy {
    using SafeMath for uint256;

    /*
    * Define bonus schedule of tranches.
    */
    struct BonusSchedule {

        //rate of bonus for current of tranche
        uint256 bonus;

        //Value of tokens available the current period
        uint valueForTranche;

        uint rate;
    }

    //event for testing
    event TokenForInvestor(uint256 _token, uint256 _tokenAndBonus, uint256 indexOfperiod, uint256 bonusRate);

    uint MAX_TRANCHES = 50;

    //Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusSchedule[] public tranches; 

    /*
    * @dev Constructor
    * @param _bonuses uint256[] Bonuses in tranches
    * @param _valueForTranches uint[] Value of tokens in tranches
    * @params _rates uint[] Rates for tranches
    */
    function TrancheStrategy(uint256[] _bonuses, uint[] _valueForTranches, uint[] _rates) public {

        require(_bonuses.length == _valueForTranches.length && _valueForTranches.length == _rates.length);
        require(_bonuses.length <= MAX_TRANCHES);

        for (uint i = 0; i < _bonuses.length; i++) {
            tranches.push(BonusSchedule({
                bonus: _bonuses[i],
                valueForTranche: _valueForTranches[i],
                rate: _rates[i]
            }));
        }
    }

    /*
    * @dev Count number of tokens with bonuses
    * @param _value uint256 Value in ether
    * @return uint256 Return number of tokens for an investor
    */
    function countTokens(uint256 _value) public onlyCrowdsale returns (uint256 tokensAndBonus) {
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
    }

     /*
     * @dev Check required of tokens in the tranche
     * @param _requiredTokens uint256 Number of tokens
     * @return boolean Return true if count of tokens is available
     */
    function getFreeTokensInTranche(uint256 _requiredTokens) internal constant returns (bool) {
        bool hasTokens = false;
        uint256 indexOfTranche = defineTranchePeriod();
        hasTokens = tranches[indexOfTranche].valueForTranche > _requiredTokens;

        return hasTokens;
    }

    /*
    * @dev Summing sold of tokens
    * @param _tokensAndBonus uint256 Number tokens for current sale
    */
    function soldInTranche(uint256 _tokensAndBonus) internal {
        uint256 indexOfTranche = defineTranchePeriod();
        require(tranches[indexOfTranche].valueForTranche >= _tokensAndBonus);
        tranches[indexOfTranche].valueForTranche = tranches[indexOfTranche].valueForTranche.sub(_tokensAndBonus);
        totalSoldTokens.add(_tokensAndBonus);
    }

    /*
    * @dev Check sum of the tokens for sale in the tranches in the crowdsale time
    */
    function isNoEmptyTranches() public constant returns(bool) {
        uint256 sumFreeTokens = 0;
        for (uint i = 0; i < tranches.length; i++) {
            sumFreeTokens = sumFreeTokens.add(tranches[i].valueForTranche);
        }
        bool isValid = sumFreeTokens > 0 && now <= endTime;
        return isValid;
    }

    /*
    * @dev get index of tranche
    * @return uint256 number of current tranche in array tranches
    */
    function defineTranchePeriod() internal constant returns (uint256) {
        for (uint256 i = 0; i < tranches.length; i++) {
            if (tranches[i].valueForTranche > 0) {
                return i;
            }
        }
        return MAX_TRANCHES + 1;
    }

}
