var testData = require("./config.json")[0]
var Migrations = artifacts.require("./Migrations.sol");
var MowjowToken = artifacts.require("./MowjowToken.sol");
var EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
var PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
var TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol"); 
var MowjowFunds = artifacts.require("./MowjowFunds.sol");   

module.exports =  async function (deployer, network, accounts) {   
  
   deployer.deploy(Migrations, testData.gasValue);
   deployer.link(Migrations, MowjowToken);
   deployer.deploy(MowjowToken, testData.gasValue);
   deployer.link(MowjowToken, MowjowFunds);
   deployer.deploy(MowjowFunds, testData.gasValue);
   deployer.link(MowjowFunds, TrancheStrategy)
   deployer.deploy(TrancheStrategy, testData.bonusesIco,testData.valueForTranches, testData.gasValue);
   deployer.link(TrancheStrategy, EarlyContribStrategy);
   deployer.deploy(EarlyContribStrategy, testData.bonusEarlyContrib, testData.valueEarlyContrib, testData.gasValue);
   deployer.link(EarlyContribStrategy, PreIcoStrategy);
   deployer.deploy(PreIcoStrategy, testData.bonusPreIco, testData.valuePreIco, testData.gasValue);
   deployer.link(PreIcoStrategy, FinalizableMowjow);
   deployer.deploy(FinalizableMowjow, accounts[1], testData.gasValue); 
};
