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

contract('FinalizableMowjow', function ([_, investor, wallet, purchaser]) {
    const cap = ether(2);
    const rate = new BigNumber(20000);
    const value = ether(0.0000000000000001);

    const expectedTokenAmount = rate.mul(value).mul(2);

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    });

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1);

        this.finalizableMowjow = await FinalizableMowjow.deployed();
        this.earlyContribStrategy = await EarlyContribStrategy.deployed();
        this.preIcoStrategy = await PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await TrancheStrategy.new([100], [80000], [40000]);
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address);
        let tokenAddress = await this.mowjowCrowdsale.token();
        this.token = MowjowToken.at(tokenAddress);
    });

    describe("finalize did not start", function() {

        beforeEach(function () {

        });

        it('is not finalized after start', async function () {
            let isFinalize = await this.mowjowCrowdsale.isFinalized();
            isFinalize.should.be.equal(false);
            let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale();
            isFinishedCrowdsale.should.be.equal(false);
        });

        it('should be ended if cap reached', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});

            await this.mowjowCrowdsale.buyTokens(investor, { value: ether(1), from: purchaser }); // presale
            await this.mowjowCrowdsale.buyTokens(investor, { value: ether(1), from: purchaser }); // crowdsale

            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true)
        });

        it('should be finalized', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});

            await this.mowjowCrowdsale.buyTokens(investor, { value: ether(1), from: purchaser }); // presale
            await this.mowjowCrowdsale.buyTokens(investor, { value: ether(1), from: purchaser }); // crowdsale

            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true);
            await this.mowjowCrowdsale.finalize({from: _});
            let isFinalize = await this.mowjowCrowdsale.isFinalized();
            isFinalize.should.be.equal(true);
            let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale();
            isFinishedCrowdsale.should.be.equal(true);
        })
    })
});
