var TrancheStrategy = artifacts.require("./TrancheStrategy.sol");

module.exports = function (deployer, network) {
    const _daysOfTranches   = [0, 15, 30, 40, 50];  //days after start the crowdsale, when starting a new tranches
    const _bonuses          = [50, 35, 20, 5, 0];   //rate of bonus for the current tranche
    const _valueForTranches = [4e8, 4e8, 4e8, 4e8, 4e8];    //max count tokens for sale without bonus token
    
    deployer.deploy(TrancheStrategy, _daysOfTranches, _bonuses, _valueForTranches); 
};
