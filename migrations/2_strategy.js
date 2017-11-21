var EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
var PreIcoStrategy       = artifacts.require("./PreIcoStrategy.sol");
var TrancheStrategy      = artifacts.require("./TrancheStrategy.sol");

module.exports = function (deployer, network) {
    const gasValue = { gas: 800000000 };
    const _bonusesIco          = [35, 20, 5, 0];   //rate of bonus for the current tranche
    const _valueForTranches    = [6e8, 6e8, 6e8, 6e8];    //max count tokens for sale without bonus token
    const _bonusPreIco         = 50;  
    const _valuePreIco         = 6e8;
    const _bonusEarlyContrib   = 100; 
    const _valueEarlyContrib   = 1e8;

    deployer.deploy(TrancheStrategy, _bonusesIco, _valueForTranches, gasValue); 
    deployer.deploy(EarlyContribStrategy, _bonusEarlyContrib, _valueEarlyContrib, gasValue); 
    deployer.deploy(PreIcoStrategy, _bonusPreIco, _valuePreIco, gasValue); 
};
