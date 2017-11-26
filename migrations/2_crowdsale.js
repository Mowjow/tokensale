var testData = require("./config.json")[0];
 
var EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
var PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
var TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol"); 
var MowjowFunds = artifacts.require("./MowjowFunds.sol"); 
var MowjowCrowdsale = artifacts.require('MowjowCrowdsale');
 

module.exports =  async function (deployer, network, accounts) { 

   const finalizableMowjow = await FinalizableMowjow.deployed();
   const earlyContribStrategy = await EarlyContribStrategy.deployed();
   const preIcoStrategy = await PreIcoStrategy.deployed();
   const trancheStrategy = await TrancheStrategy.deployed();
   let startDate = new Date('12-15-2017').getTime(); // TODO CHANGE THIS
   let endDate = new Date('12-30-2020').getTime();
    // 1510844468, 1513429708
   await deployer.deploy(MowjowCrowdsale, startDate, endDate, 15000, accounts[1], 15000,
       earlyContribStrategy.address, preIcoStrategy.address, trancheStrategy.address,
       finalizableMowjow.address, { "gas": 47000000});
};
