const t = require('./helper');
const should = t.should;

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {

    before(async function () {
    });

    beforeEach(async function () {
        this.startTime = t.latestTime() + t.duration.weeks(1);
        this.endTime = this.startTime + t.duration.weeks(8);
        this.afterEndTime = this.endTime + t.duration.seconds(1);

        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await t.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            this.startTime, this.endTime, t.rate, wallet, t.cap,
            t.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, t.finalizableMowjow.address);
        this.token = t.MowjowToken.at(await this.mowjowCrowdsale.token());
    });

    describe('ending time finished', function () {

        it('should not be ended if time of the crowdsale', async function () {
            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(false);
            await t.increaseTimeTo(this.afterEndTime);
            hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true);
        });

        it('should rejected after end time the crowdsale', async function () {
            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(false);
            await t.increaseTimeTo(this.afterEndTime);
            await this.mowjowCrowdsale.buyTokens(investor,
                { from: purchaser, value: t.value }).should.be.rejectedWith(t.EVMRevert);
        });
    })
});
