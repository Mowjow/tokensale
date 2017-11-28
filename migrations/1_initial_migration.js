const testData = require("./config.json");
const Migrations = artifacts.require("./Migrations.sol");
const EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
const PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
const TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
const FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");
const MowjowFunds = artifacts.require("./MowjowFunds.sol");

module.exports = function (deployer, network, accounts) {
   return deployer.deploy(Migrations, testData.gasValue)
       .then( res => deployer.deploy(MowjowFunds, testData.gasValue))
       .then(async res => {
          const  mj = await MowjowFunds.deployed();
          return deployer.deploy(FinalizableMowjow, mj.address, testData.gasValue);
       })
       .then(async res => deployer.deploy(TrancheStrategy,
           testData.bonusesIco,testData.valueForTranches, testData.rates, testData.gasValue))
       .then(async res => deployer.deploy(EarlyContribStrategy, testData.early_contributors.bonus,
                testData.early_contributors.token_cap, testData.early_contributors.rate,testData.gasValue))
       .then(async res => deployer.deploy(PreIcoStrategy, testData.pre_ico.bonus,
           testData.pre_ico.token_cap, testData.pre_ico.rate,testData.gasValue));
};
