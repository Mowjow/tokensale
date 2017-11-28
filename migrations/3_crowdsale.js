const testData = require("./config.json");
const EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
const PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
const TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
const FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");
const MowjowFunds = artifacts.require("./MowjowFunds.sol");
const MowjowCrowdsale = artifacts.require('MowjowCrowdsale.sol');


module.exports = async function (deployer, network, accounts) {

    const preIcoStrategy = await PreIcoStrategy.deployed();
    const trancheStrategy = await TrancheStrategy.deployed();
    const finalizableMowjow = await FinalizableMowjow.deployed();
    const earlyContribStrategy = await EarlyContribStrategy.deployed();

    let startDate = new Date('12-15-2017').getTime(); // 1510844468
    let endDate = new Date('12-30-2020').getTime(); // 1513429708

    await deployer.deploy(MowjowCrowdsale, startDate, endDate, 15000, accounts[1], 15000,
        earlyContribStrategy.address, preIcoStrategy.address, trancheStrategy.address,
        finalizableMowjow.address, {gas: 99999999});
};
