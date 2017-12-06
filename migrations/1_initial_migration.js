const testData = require("./config.json");
const Migrations = artifacts.require("./Migrations.sol");
const EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
const PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
const TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
const FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");
const MowjowFunds = artifacts.require("./MowjowFunds.sol");

let startDate = new Date('12-15-2017').getTime(); // 1510844468
let endDate = new Date('12-30-2020').getTime(); // 1513429708

module.exports = function (deployer, network, accounts) {
    return deployer.deploy(Migrations, testData.gasValue)
        .then(res => deployer.deploy(MowjowFunds, testData.gasValue))
        .then(async res => {
            const mj = await MowjowFunds.deployed();
            return deployer.deploy(FinalizableMowjow, mj.address, testData.gasValue);
        })
        .then(async res => {
            const finalizableAddress = await FinalizableMowjow.deployed();
            const mj = await MowjowFunds.deployed();
            const actionOwners = [finalizableAddress.address, accounts[0]];
            return mj.setActionOwners(actionOwners);
        })
        .then(async res => deployer.deploy(TrancheStrategy,
            testData.test_data.bonusesIco, testData.test_data.valueForTranches, testData.test_data.rates, testData.gasValue))
        .then(async res => deployer.deploy(EarlyContribStrategy, testData.early_contributors.bonus,
            testData.early_contributors.token_cap, testData.early_contributors.rate, testData.gasValue))
        .then(async res => deployer.deploy(PreIcoStrategy, testData.test_data.bonus,
            testData.test_data.token_cap, testData.test_data.rate, testData.gasValue))
        .then(async res => {
            return PreIcoStrategy.deployed()
                .then(async function (preIco) {
                    await preIco.setEndDate(endDate);
                    let date = await preIco.endTime();
                    return TrancheStrategy.deployed();
                })
                .then(async function (tranche) {
                    await tranche.setEndDate(endDate);
                    return FinalizableMowjow.deployed();
                })
                .then(function () {
                    return EarlyContribStrategy.deployed();
                })
        });
};
