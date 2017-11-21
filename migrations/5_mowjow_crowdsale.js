var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");
var TrancheStrategy   = artifacts.require("./TrancheStrategy.sol");
var MowjowCrowdsale   = artifacts.require("./MowjowCrowdsale.sol");

module.exports = async  function  (deployer, network, accounts) {
    const gasValue           = { gas: 800000000 };
    const _finalizableMowjow = await FinalizableMowjow.deployed();
    const _trancheStrategy   = await TrancheStrategy.deployed();   
    const _startTime = 1510844468, _endTime = 1513429708, _rate = 20000, _wallet = accounts[1], _cap = 1000; 
    // await deployer.deploy(MowjowCrowdsale, _startTime,  _endTime ,_rate , _wallet,  _cap,
    //     _trancheStrategy.address   , _finalizableMowjow.address, gasValue); 
};
