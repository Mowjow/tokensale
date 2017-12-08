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

const should = helper.should;

contract('EarlyContribStrategy', function ([_, investor, wallet, purchaser]) {


    before(async function () {
        await helper.advanceBlock();
        const startTime = helper.latestTime() + helper.duration.weeks(1),
              endTime = startTime + helper.duration.weeks(8),
              afterEndTime = endTime + helper.duration.weeks(8),
              rate = 40000;

        this.crowdsaleParams = {
            rate: 1,
            cap: helper.ether(1),
            start_time: startTime,
            end_time: endTime,
            after_end_time: afterEndTime
        };

        this.etherValue = helper.ether(0.0000000000000001);
        this.PURCHASE_EVENT = 'Purchase';
        this.expectedTokenAmount = new helper.BigNumber(rate).mul(this.etherValue).mul(2);
    });

    beforeEach(async function () {

        // const [crowdsale, token, finalize] = await helper.setupCrowdsaleSuite(
        //     setupParams, this.crowdsaleParams, _, wallet
        // );
        // this.mowjowCrowdsale = crowdsale;
        // this.token = token;
        // this.finalizableMowjow = finalize;
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

        const mowjowFunds = await MowjowFunds.deployed();
        const finalizableMowjow = await FinalizableMowjow.new(mowjowFunds.address);

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
            trancheStrategy.address, finalizableMowjow.address
        );

        const mowjowCrowdsaleAddress = this.mowjowCrowdsale.address;
        await preIcoStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
        await trancheStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
        await earlyContribStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);

        const tokenInstance = await this.mowjowCrowdsale.token();
        this.token = await MowjowToken.at(tokenInstance);
    });

    describe('payments for early contributors', function () {

        it('should add investor to early contributor list successfully', async function () {
            const {logs} = await this.mowjowCrowdsale.addEarlyContributors(investor, this.etherValue, {from: _});
            const event = logs.find(e => e.event === this.PURCHASE_EVENT);
            should.exist(event);

            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(this.etherValue);
            event.args.amount.should.be.bignumber.equal(this.expectedTokenAmount);

            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(this.expectedTokenAmount);
        });

        it('should reject add to early contributor list after end pre ico', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            await this.mowjowCrowdsale.buyTokens(investor, {value: helper.ether(1), from: purchaser});

            await this.mowjowCrowdsale.addEarlyContributors(investor, this.etherValue)
                .should.be.rejectedWith(helper.EVMRevert);
        })
    })
});
