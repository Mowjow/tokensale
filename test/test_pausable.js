const helper = require('./helper');
const { setupParams, PURCHASE_EVENT } = require('./helpers/config.json');
const MowjowToken = artifacts.require('./MowjowToken.sol');

const should = helper.should;

contract('MowjowCrowdsale manage pause', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        await helper.advanceBlock();
    });

    beforeEach(async function () {

        const [mowjowCrowdsale, finalizableMowjow, token] = await helper.setupCrowdsaleSuite(
            setupParams, helper.crowdsaleParams, _, wallet
        );
        this.mowjowCrowdsale = mowjowCrowdsale;
        this.token = token;
        this.finalizableMowjow = finalizableMowjow;
    });

    describe('payments in pre ico with 100% bonuses', function () {

        it('should be owner as manager of pause logic', async function () {

            let ownerPause = await this.token.ownerPauseStatement();
            ownerPause.should.be.equal(_)
        });

    })
});
