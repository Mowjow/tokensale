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
    crowdsale: {
        rate: 1,
        cap: 2,
    }
};

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await helper.advanceBlock();
        await helper.advanceBlock();
        const startTime = helper.latestTime() + helper.duration.weeks(1),
            endTime = startTime + helper.duration.weeks(8),
            afterEndTime = endTime + helper.duration.weeks(8);


        this.crowdsaleParams = {
            rate: 1,
            cap: helper.ether(3),
            start_time: startTime,
            end_time: endTime,
            after_end_time: afterEndTime
        };

        this.etherValue = helper.ether(0.0000000000000001);
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

    describe('accepting payments', function () {

        it('should be token owner', async function () {
            const owner = await this.token.owner();
            owner.should.equal(this.mowjowCrowdsale.address);
        });

        it('should reject payments when amount of investor is zero', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: 0, from: purchaser })
                .should.be.rejectedWith(helper.EVMRevert);
        });
    });
});
