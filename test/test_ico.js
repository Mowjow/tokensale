const t = require('./helper');
const config = require('../migrations/config.json');

const should = t.should;

contract('MowjowCrowdsaleIco', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        // await t.advanceBlock();

        this.startTime = t.latestTime() + t.duration.weeks(1);
        this.endTime = this.startTime + t.duration.weeks(8);
        this.afterEndTime = this.endTime + t.duration.seconds(1);

        this.preIcoStrategy = await t.PreIcoStrategy.deployed();
        this.trancheStrategy = await t.TrancheStrategy.deployed();
        // this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        // this.trancheStrategy = await t.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        const mj = await t.MowjowFunds.deployed();
        this.finalizableMowjow = await t.FinalizableMowjow.new(mj.address);

        this.earlyContribStrategy = await t.EarlyContribStrategy.new(
            config.early_contributors.bonus, config.early_contributors.token_cap,
            config.early_contributors.rate
        );

        await this.preIcoStrategy.setEndDate(this.endTime);
        await this.trancheStrategy.setEndDate(this.endTime);

        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            this.startTime, this.endTime, t.rate, wallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address
        );

        await this.preIcoStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.trancheStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.earlyContribStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);

        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
        this.val = t.ether(0.5);
    });

    describe('payments in pre ico with 100% bonuses', function () {

        it('should investor pay in pre ico tranche and first ico', async function () {

            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value: this.val, from: purchaser });

            const event = logs.find(e => e.event === 'Purchase');
            should.exist(event);
        });

        it('should 100% bonus in second tranche', async function () {
            const expectedValue = 80000;
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: _});
            const logs   = await this.mowjowCrowdsale.buyTokens(purchaser, { value: t.value, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(purchaser, { value: t.value, from: purchaser });
            const event = logs.logs.find(e => e.event === 'Purchase');
            should.exist(event);
            event.args.amount.should.be.bignumber.equal(expectedValue);
        })
    })
});
