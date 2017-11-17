var TrancheStrategy = artifacts.require("./TrancheStrategy.sol");

module.exports = function (deployer, network) {
    const gasValue = { gas: 800000000 };
    const _bonuses          = [50, 35, 20, 5, 0];   //rate of bonus for the current tranche
    const _valueForTranches = [4e8, 4e8, 4e8, 4e8, 4e8];    //max count tokens for sale without bonus token
    
    deployer.deploy(TrancheStrategy, _bonuses, _valueForTranches, gasValue); 
};
