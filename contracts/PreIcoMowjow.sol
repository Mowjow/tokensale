pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./MowjowToken.sol";
import "./MowjowCrowdsale.sol";

contract PreIcoMowjow {

    using SafeMath for uint256;

    /// @notice starting exchange rate of Mowjow token
    //   need details
    uint public constant rateMowjow = 20000;

    /// @notice additional tokens bonus percent
    //   need details
    uint public constant earlyContributorsBonus = 100;

    uint public constant preIcoCap = 5000;
    uint public startTimePreIco;
    address[] public whitelistInvestors = [0x1234];
    event PreIcoMowjowStarted(uint startTime, uint endTime);

    function PreIcoMowjow (uint startTimeCrowdsale) { 
        startTimePreIco = startTimeCrowdsale - (20 days);
        PreIcoMowjowStarted(getStartTime(), getEndTime());
    }

    function buyPreIcoTokens (uint256 value) public returns (uint256) {
        require(now < getEndTime());
        return calculateTokens(value); 
    }

    /// @notice start time of the pre-ICO
    function isWhitelistInvestors(address investor) public  returns (bool) {
        bool hasInvestor = false;
        for (uint256 i = 0; i < whitelistInvestors.length; i++) {
            if (investor == whitelistInvestors[i]) {
                hasInvestor = true; 
            } 
        }
        return hasInvestor;
    }

    /// @notice start time of the pre-ICO
    function getStartTime() internal constant returns (uint) {
        // FIXME: need details 
        return startTimePreIco;
    }

    /// @notice end time of the pre-ICO
    function getEndTime() internal constant returns (uint) {
        // FIXME: need details
        return getStartTime() + (10 days);
    }

    function calculateTokens(uint256 payment) internal constant returns (uint256) {
        uint rate = rateMowjow.mul(earlyContributorsBonus.add(100)).div(100);
        return payment.mul(rate);
    }
}
