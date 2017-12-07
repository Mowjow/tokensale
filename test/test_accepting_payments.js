const t = require('./helper');
const config = require('../migrations/config.json');
const should = t.should;

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await t.advanceBlock();

        this.startTime = new Date('12-15-2021').getTime();
        this.endTime = new Date('12-15-2022').getTime();
        this.afterEndTime = new Date('12-15-2023').getTime();

        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await t.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        const mj = await t.MowjowFunds.deployed();
        this.finalizableMowjow = await t.FinalizableMowjow.new(mj.address);

        this.earlyContribStrategy = await t.EarlyContribStrategy.new(
            config.early_contributors.bonus, config.early_contributors.token_cap,
            config.early_contributors.rate
        );

        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            this.startTime, this.endTime, t.rate, wallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address
        );

        this.token = t.MowjowToken.at(await this.mowjowCrowdsale.token());
    });

    describe('accepting payments', function () {

        it('should be token owner', async function () {
            const owner = await this.token.owner();
            owner.should.equal(this.mowjowCrowdsale.address);
        });

        it('should reject payments when amount of investor is zero', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: 0, from: purchaser })
                .should.be.rejectedWith(t.EVMRevert);
        });

        // it('should be ended only after end date', async function () {
        //     let ended = await this.mowjowCrowdsale.hasEnded();
        //     ended.should.equal(false);
        //     await t.increaseTimeTo(this.afterEndTime);
        //     ended = await this.mowjowCrowdsale.hasEnded();
        //     ended.should.equal(true);
        // });
    });
});
