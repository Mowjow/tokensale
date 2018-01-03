pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./PricingStrategy.sol";
import {Bounty, Target} from "zeppelin-solidity/contracts/Bounty.sol";

contract  PreIcoStrategy is PricingStrategy, Target {
    using SafeMath for uint256;

    uint256 public rate;
    uint256 public bonus;
    uint256 public maxCap;

    //events for testing
    event TokenForPreIcoInvestor(uint256 _token, uint256 _tokenAndBonus, uint256 bonusRate);

    /*
    * @dev Constructor
    */
    function PreIcoStrategy(uint256 _bonus, uint _maxCap, uint256 _rate) public {
        bonus = _bonus;
        maxCap = _maxCap;
        rate = _rate;
    }


    /*
    * @dev Count number of tokens with bonuses
    * @return uint256 Return number of tokens for an investor
    */
    function countTokens(uint256 _value) public onlyCrowdsale returns (uint256 tokensAndBonus) {
        uint256 etherInWei = 1e18;
        require(_value >= etherInWei.div(rate));

        uint256 tokens = _value.div(1e18).mul(rate);
        uint256 bonusToken = (tokens).mul(bonus).div(100);

        uint256 freeTokens = getUnSoldTokens();
        tokensAndBonus = tokens.add(bonusToken);

        if(freeTokens >= tokensAndBonus) {
            soldInTranche(tokensAndBonus);
            TokenForPreIcoInvestor(tokens, tokensAndBonus, rate);
        } else {
            require(false);
        }
        return tokensAndBonus;
    }

    /*
    * @dev Check required of tokens in the tranche
    * @param _requiredTokens uint256 Number of tokens
    * @return boolean Return true if count of tokens is available
    */
    function getFreeTokensInTranche(uint256 requiredTokens) internal constant returns (bool) {
        return (maxCap - totalSoldTokens) >= requiredTokens;
    } 

    function getUnSoldTokens() public constant returns (uint256) {
        return maxCap - totalSoldTokens;
    }

    function isNoEmptyTranches() public constant returns(bool) {
        uint256 availableTokens = maxCap - totalSoldTokens;
        return availableTokens > 0 && now <= endTime;
    }
     
    /*
    * @dev Summing sold of tokens
    */ 
    function soldInTranche(uint256 tokens) internal {
        totalSoldTokens = totalSoldTokens.add(tokens);
    }

    bool public compromised = false; // In testing, true means the contract was breached

    /* Now we have the Bounty code, as the contract is Bounty.
    * @dev Function to check if the contract has been compromised.
    */
    function checkInvariant() public returns(bool) {
        // Check the compromised flag.
        if (compromised == true) {
            return false;
        }
        return true;
    }

    /**
    * @dev Toggle the compromised flag. For testing the bounty program
    */
    function compromiseContract() public {
        compromised = true;
    }
}
