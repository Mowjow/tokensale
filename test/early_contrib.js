const t = require('./helper');
const config = require('../migrations/config.json');
const should = t.should;


contract('EarlyContribStrategy', function ([_, investor, wallet, purchaser]) {
    const value = t.ether(0.0000000000000001);
    const PURCHASE_EVENT = 'Purchase';

    const expectedTokenAmount = t.rate.mul(value).mul(2); // 100% bonus

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await t.advanceBlock()
    });

    beforeEach(async function () {

        this.startTime = t.latestTime() + t.duration.weeks(1);
        this.endTime = this.startTime + t.duration.weeks(8);
        this.afterEndTime = this.endTime + t.duration.seconds(1);

        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await t.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
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
    });

    describe('payments for early contributors', function () {
        beforeEach(async function () {
        });

        it('should add investor to early contributor list successfully', async function () {
            const {logs} = await this.mowjowCrowdsale.addEarlyContributors(investor, value, {from: _});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(value);
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(expectedTokenAmount);
        });

        it('should reject add to early contributor list after end pre ico', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            await this.mowjowCrowdsale.buyTokens(investor, {value: t.ether(1), from: purchaser});

            await this.mowjowCrowdsale.addEarlyContributors(investor, value).should.be.rejectedWith(t.EVMRevert);
        })
    })
});
