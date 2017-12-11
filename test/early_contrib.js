const helper = require('./helper');
const { setupParams, PURCHASE_EVENT } = require('./helpers/config.json');

const should = helper.should;

contract('EarlyContribStrategy', function ([_, investor, wallet, purchaser]) {


    before(async function () {
        await helper.advanceBlock();
    });

    beforeEach(async function () {
        const [crowdsale, finalize, token] = await helper.setupCrowdsaleSuite(
            setupParams, helper.crowdsaleParams, _, wallet
        );
         this.mowjowCrowdsale = crowdsale;
         this.token = token;
    });

    describe('payments for early contributors', function () {

        it('should add investor to early contributor list successfully', async function () {
            const {logs} = await this.mowjowCrowdsale.addEarlyContributors(investor, helper.etherValue, {from: _});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);

            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(helper.etherValue);
            event.args.amount.should.be.bignumber.equal(helper.expectedTokenAmount);

            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(helper.expectedTokenAmount);
        });

        it('should reject add to early contributor list after end pre ico', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            await this.mowjowCrowdsale.buyTokens(investor, {value: helper.ether(1), from: purchaser});

            await this.mowjowCrowdsale.addEarlyContributors(investor, helper.etherValue)
                .should.be.rejectedWith(helper.EVMRevert);
        })
    })
});
