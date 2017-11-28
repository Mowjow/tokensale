const ether = require('./helpers/ether');
const advanceBlock = require('./helpers/advanceToBlock');
const increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
const duration = require('./helpers/increaseTime').duration;
const latestTime = require('./helpers/latestTime');
const EVMThrow = require('./helpers/EVMThrow');

const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


const MowjowCrowdsale = artifacts.require('MowjowCrowdsale');
const MowjowToken = artifacts.require('MowjowToken');
const EarlyContribStrategy = artifacts.require("EarlyContribStrategy");
const PreIcoStrategy = artifacts.require("PreIcoStrategy");
const TrancheStrategy = artifacts.require('TrancheStrategy');
const FinalizableMowjow = artifacts.require('FinalizableMowjow');

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser, secondInvestor]) {
    const cap = ether(0.1);
    const rate = new BigNumber(40000);
    const value = ether(1);

    const expectedTokenAmount = rate.mul(value).mul(1.5);

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1);

        this.finalizableMowjow = await FinalizableMowjow.deployed();
        this.earlyContribStrategy = await EarlyContribStrategy.deployed();
        this.preIcoStrategy = await PreIcoStrategy.new(100, 80000, 40000);

        this.trancheStrategy = await TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address);

        this.token = MowjowToken.at(await this.mowjowCrowdsale.token());
    });

    describe('ending time finished', function () { 

        it('should not be ended if time of the crowdsale', async function () {
            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(false); 
            await increaseTimeTo(this.afterEndTime);
            hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true);
        })

        it('should rejected after end time the crowdsale', async function () {
            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(false);
            await increaseTimeTo(this.afterEndTime);
            await this.mowjowCrowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMThrow);
        })
    })
})
