module.exports.ether = require('./helpers/ether');
module.exports.advanceBlock = require('./helpers/advanceToBlock');
module.exports.increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
module.exports.duration = require('./helpers/increaseTime').duration;
module.exports.latestTime = require('./helpers/latestTime');
module.exports.EVMThrow = require('./helpers/EVMThrow');
module.exports.EVMRevert = require('./helpers/EVMRevert');
module.exports.BigNumber = web3.BigNumber;
module.exports.should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(this.BigNumber))
    .should();

module.exports.MowjowCrowdsale = artifacts.require('MowjowCrowdsale');
module.exports.MowjowToken = artifacts.require('MowjowToken');
module.exports.EarlyContribStrategy = artifacts.require("EarlyContribStrategy");
module.exports.PreIcoStrategy = artifacts.require("PreIcoStrategy");
module.exports.TrancheStrategy = artifacts.require('TrancheStrategy');
module.exports.FinalizableMowjow = artifacts.require('FinalizableMowjow');
module.exports.MultiSigMowjow = artifacts.require('MultiSigMowjow');
module.exports.MowjowFunds = artifacts.require('MowjowFunds');
module.exports.cap = this.ether(0.1);
module.exports.rate = new this.BigNumber(40000);
module.exports.value = this.ether(1);


module.exports.startTime = this.latestTime() + this.duration.weeks(1);
module.exports.endTime = this.startTime + this.duration.weeks(8);
module.exports.afterEndTime = this.endTime + this.duration.seconds(1);
module.exports.mowjowFunds = this.MowjowFunds.deployed();
module.exports.finalizableMowjow = this.FinalizableMowjow.deployed();
module.exports.earlyContribStrategy = this.EarlyContribStrategy.deployed();
module.exports.multiSigMowjow = this.MultiSigMowjow.deployed();
module.exports.preIcoStrategy = this.PreIcoStrategy.new(100, 80000, 40000);
module.exports.trancheStrategy = this.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);


