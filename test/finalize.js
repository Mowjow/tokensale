const helper = require('./helper');
const { setupParams } = require('./helpers/config.json');

const should = helper.should;

contract('MowjowCrowdsaleFin', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await helper.advanceBlock();
    });

    beforeEach(async function () {
        const [crowdsale, finalize, token] = await helper.setupCrowdsaleSuite(
            setupParams, helper.crowdsaleParams, _, wallet
        );
        this.mowjowCrowdsale = crowdsale;
        this.token = token;
        this.finalizableMowjow = finalize;
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
            await this.mowjowCrowdsale.addMowjowInvestors(investor, true, {from: _});
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });
            await this.mowjowCrowdsale.buyTokens(investor, { value: etherAmount, from: purchaser });

            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true);
        });

        it('should be finalized', async function () {
            const etherAmount = helper.ether(1);
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            await this.mowjowCrowdsale.addMowjowInvestors(investor, true, {from: _});
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
