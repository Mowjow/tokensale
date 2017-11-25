var testData = require("./config.json")[0]
 
var EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
var PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
var TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol"); 
var MowjowFunds = artifacts.require("./MowjowFunds.sol"); 
var MowjowCrowdsale = artifacts.require('MowjowCrowdsale')
 

module.exports =  async function (deployer, network, accounts) { 

   const finalizableMowjow = FinalizableMowjow.deployed();   
   const earlyContribStrategy = EarlyContribStrategy.deployed() ;
   const preIcoStrategy = PreIcoStrategy.deployed();
   const trancheStrategy = TrancheStrategy.deployed();
   deployer.deploy(MowjowCrowdsale, 1510844468, 1513429708, 15000, accounts[1], 15000, earlyContribStrategy.address, preIcoStrategy.address, trancheStrategy.address, finalizableMowjow.address, testData.gasValue);
  // deployer.link(MowjowCrowdsale, MultiSigMowjow);
  // deployer.deploy(MultiSigMowjow,ownersMultisig, requiredConfirmations, testData.gasValue)
};
