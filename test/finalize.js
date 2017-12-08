const helper = require('./helper');
const config = require('../migrations/config.json');

const MowjowCrowdsale = artifacts.require('MowjowCrowdsale'),
    MowjowToken = artifacts.require('MowjowToken'),
    EarlyContribStrategy = artifacts.require("EarlyContribStrategy"),
    PreIcoStrategy = artifacts.require("PreIcoStrategy"),
    TrancheStrategy = artifacts.require('TrancheStrategy'),
    FinalizableMowjow = artifacts.require('FinalizableMowjow'),
    MultiSigMowjow = artifacts.require('MultiSigMowjow'),
    MowjowFunds = artifacts.require('MowjowFunds');

const setupParams = {
    pre_ico: {
        bonus: 100,
        amount: 80000,
        rate: 40000
    },
    tranche_strategy: {
        bonus: [100, 100],
        amount: [80000, 80000],
        rate: [40000, 40000]
    },
    early_contributors: {
        bonus: 100,
        amount: 80000,
        rate: 40000
    },
    crowdsale: {
        rate: 1,
        cap: 2,
    }
};

contract('MowjowCrowdsaleFin', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await helper.advanceBlock();
        const startTime = helper.latestTime() + helper.duration.weeks(1),
            endTime = startTime + helper.duration.weeks(8),
            afterEndTime = endTime + helper.duration.weeks(8),
            rate = 40000;

        this.crowdsaleParams = {
            rate: 1,
            cap: helper.ether(3),
            start_time: startTime,
            end_time: endTime,
            after_end_time: afterEndTime
        };

        this.etherValue = helper.ether(0.0000000000000001);
        this.PURCHASE_EVENT = 'Purchase';
        this.expectedTokenAmount = new helper.BigNumber(rate).mul(this.etherValue).mul(2);
    });

    beforeEach(async function () {

        const preIcoStrategy = await PreIcoStrategy.new(
            setupParams.pre_ico.bonus,
            setupParams.pre_ico.amount,
            setupParams.pre_ico.rate
        );

        const trancheStrategy = await TrancheStrategy.new(
            setupParams.tranche_strategy.bonus,
            setupParams.tranche_strategy.amount,
            setupParams.tranche_strategy.rate
        );

        const mowjowFunds = await MowjowFunds.new();
        this.finalizableMowjow = await FinalizableMowjow.new(mowjowFunds.address);

        await preIcoStrategy.setEndDate(this.crowdsaleParams.end_time);
        await trancheStrategy.setEndDate(this.crowdsaleParams.end_time);

        const earlyContribStrategy = await EarlyContribStrategy.new(
            config.early_contributors.bonus, config.early_contributors.token_cap,
            config.early_contributors.rate
        );

        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.crowdsaleParams.start_time, this.crowdsaleParams.end_time,
            this.crowdsaleParams.rate, wallet, this.crowdsaleParams.cap,
            earlyContribStrategy.address, preIcoStrategy.address,
            trancheStrategy.address, this.finalizableMowjow.address
        );

        const mowjowCrowdsaleAddress = this.mowjowCrowdsale.address;
        await preIcoStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
        await trancheStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
        await earlyContribStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
        await this.finalizableMowjow.setCrowdsaleAddress(mowjowCrowdsaleAddress);

        const actionOwners = [this.finalizableMowjow.address, _];
        await mowjowFunds.setActionOwners(actionOwners, {from: _});

        const tokenInstance = await this.mowjowCrowdsale.token();
        this.token = await MowjowToken.at(tokenInstance);
    });

    describe("finalize did not start", async function() {

        it('is not finalized after start', async function () {
            let isFinalize = await this.mowjowCrowdsale.isFinalized();
            isFinalize.should.be.equal(false);
            let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale();
            isFinishedCrowdsale.should.be.equal(false);
        });

        it('should be ended if cap reached', async function () {
            const etherAmount = helper.ether(1);
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});

            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });

            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true);
        });

        it('should be finalized', async function () {
            const etherAmount = helper.ether(1);
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});

            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });

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
