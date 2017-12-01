const t = require('./helper');

const should = t.should;

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await t.advanceBlock();
    });

    beforeEach(async function () {
        this.startTime = t.latestTime() + t.duration.weeks(1);
        this.endTime = this.startTime + t.duration.weeks(8);
        this.afterEndTime = this.endTime + t.duration.seconds(1);

        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);

        this.trancheStrategy = await t.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        // this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
        //     this.startTime, this.endTime, t.rate, wallet, t.cap,
        //     t.earlyContribStrategy.address, this.preIcoStrategy.address,
        //     this.trancheStrategy.address, t.finalizableMowjow.address);
        // this.token = t.MowjowToken.at(await this.mowjowCrowdsale.token());

        this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
        this.val = t.value.mul(0.5);
    });

    describe('creating a valid crowdsale', function () {

        it('should fail with zero cap', async function () {
            await t.MowjowCrowdsale.new(this.startTime, this.endTime, t.rate, wallet, 0)
                .should.be.rejectedWith(t.EVMThrow);
        })

    });

    describe('accepting payments', function () {

        it('should be token owner', async function () {
            const owner = await this.token.owner();
            owner.should.equal(this.mowjowCrowdsale.address);
        });

        it('should reject payments when amount of investor is zero', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: 0, from: purchaser })
                .should.be.rejectedWith(t.EVMThrow);
        });

        it('should be ended only after end date', async function () {
            // let ended = await this.mowjowCrowdsale.hasEnded();
            // ended.should.equal(false);
            // await t.increaseTimeTo(this.afterEndTime);
            // ended = await this.mowjowCrowdsale.hasEnded();
            // ended.should.equal(true);
        });
    });
});
