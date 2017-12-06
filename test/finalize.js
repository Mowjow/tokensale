const t = require('./helper');
const should = t.should;

contract('MowjowCrowdsaleFin', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        this.earlyContribStrategy = await t.EarlyContribStrategy.deployed();
        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        await this.preIcoStrategy.setEndDate(t.endTime);
        this.trancheStrategy = await t.TrancheStrategy.new([100], [80000], [40000]);
        await this.trancheStrategy.setEndDate(t.endTime);
        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            t.startTime, t.endTime, t.rate, wallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, t.finalizableMowjow.address);
        await this.trancheStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.preIcoStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.earlyContribStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        //this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
        // this.trancheStrategy = await t.TrancheStrategy.deployed();
        // this.finalizableMowjow = await t.FinalizableMowjow.deployed();
        // this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
        // this.val = t.value.mul(0.5);
    });

    beforeEach(async function () {
        this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
       });

    describe("finalize did not start", async function() {

        it('is not finalized after start', async function () {
            let isFinalize = await this.mowjowCrowdsale.isFinalized();
            isFinalize.should.be.equal(false);
            let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale();
            isFinishedCrowdsale.should.be.equal(false);
        });

        it('should be ended if cap reached', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});

            let pre = await this.mowjowCrowdsale.buyTokens(investor, { value: t.ether(1), from: purchaser }); // presale
            let log = await this.mowjowCrowdsale.buyTokens(investor, { value: t.ether(1), from: purchaser }); // crowdsale

            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true)
        });

        it('should be finalized', async function () {
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
