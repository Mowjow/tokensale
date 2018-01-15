const MowjowBounty = artifacts.require('MowjowBounty.sol');
const testData = require("./config.json");

module.exports = function (deployer, network, accounts) {
    /* only for bug-bounty */
        const bonusesIco = [100, 100, 100],
            valueForTranches = [4*1e18, 4*1e18, 4*1e18],
            rates = [1000, 1000, 1000],
            capInWei = 0.006e18,
            capTokens = 12 * 1e18
        ;

    // deployer.deploy(MowjowBounty, bonusesIco, valueForTranches,
    //     rates, capInWei, capTokens, {gas: 99999999, from: accounts[0]});
};
