const t = require('./helper');
const should = t.should;

contract('MowjowCrowdsaleFin', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await t.advanceBlock();
        this.finalizableMowjow = await t.FinalizableMowjow.deployed();
        this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
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

            await this.mowjowCrowdsale.buyTokens(investor, { value: t.ether(1), from: purchaser }); // presale
            await this.mowjowCrowdsale.buyTokens(investor, { value: t.ether(1), from: purchaser }); // crowdsale

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
