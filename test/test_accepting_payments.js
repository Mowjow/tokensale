const helper = require('./helper');
const { setupParams } = require('./helpers/config.json');

const should = helper.should;

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {

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

    describe('accepting payments', function () {

        it('should be token owner', async function () {
            const owner = await this.token.owner();
            owner.should.equal(this.mowjowCrowdsale.address);
        });

        it('should reject payments when amount of investor is zero', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: 0, from: purchaser })
                .should.be.rejectedWith(helper.EVMRevert);
        });
    });
});
