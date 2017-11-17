pragma solidity ^0.4.11;   

import "zeppelin-solidity/contracts/math/SafeMath.sol"; 

contract PreIcoMowjow {

    using SafeMath for uint256;

    /// @notice starting exchange rate of Mowjow token
    //   need details
    uint public constant rateMowjow = 20000;

    /// @notice additional tokens bonus percent
    //   need details
    uint public constant earlyContributorsBonus = 100;

    uint public constant preIcoCap = 5000;

    function PreIcoMowjow (address token, address funds) {

    }

    /// @notice start time of the pre-ICO
    function getStartTime() internal constant returns (uint) {
        // FIXME: need details
        //  Friday, December 1, 2017 12:00:00 AM
        return 1512086400;
    }

    /// @notice end time of the pre-ICO
    function getEndTime() internal constant returns (uint) {
        // FIXME: need details
        return getStartTime() + (10 days);
    }

    function calculateTokens(address investor, uint payment) internal constant returns (uint) {
        uint rate = rateMowjow.mul(earlyContributorsBonus.add(100)).div(100);

        return payment.mul(rate);
    }
}