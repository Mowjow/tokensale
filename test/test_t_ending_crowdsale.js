const helper = require('./helper');
const { setupParams }= require('./helpers/config.json');

const should = helper.should;

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await helper.advanceBlock();
    });

    beforeEach(async function () {

        const [crowdsale, finalize, token] = await helper.setupCrowdsaleSuite(
            setupParams, helper.crowdsaleParamsEnding, _, wallet
        );
        this.mowjowCrowdsale = crowdsale;
        this.token = token;
    });

    describe('ending time finished', function () {

        it('should not be ended if time of the crowdsale', async function () {
            let hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(false);
            await helper.increaseTimeTo(helper.crowdsaleParamsEnding.after_end_time);
            hasEnded = await this.mowjowCrowdsale.hasEnded();
            hasEnded.should.equal(true);

            await this.mowjowCrowdsale.buyTokens(investor,
                { from: purchaser, value: helper.ether(1) }).should.be.rejectedWith(helper.EVMRevert);

            let ended = await this.mowjowCrowdsale.hasEnded();
            ended.should.equal(true);
        });
    })
});
