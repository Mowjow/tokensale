const helper = require('./helper');
const { setupParams, PURCHASE_EVENT } = require('./helpers/config.json');

const should = helper.should;

contract('MowjowCrowdsaleIco', function ([_, investor, wallet, purchaser]) {

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

    describe('payments in pre ico with 100% bonuses', function () {

        it('should investor pay in pre ico tranche and first ico', async function () {

            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value: helper.ether(1), from: purchaser });

            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
        });

        it('should 100% bonus in second tranche', async function () {
            const expectedValue = 80000e18;
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: _});
            const {logs}   = await this.mowjowCrowdsale.buyTokens(purchaser, {
                value: helper.ether(1), from: purchaser
            });
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.amount.should.be.bignumber.equal(expectedValue);
            await this.mowjowCrowdsale.addMowjowInvestors(investor, true, {from: _});
            const log  = await this.mowjowCrowdsale.buyTokens(investor, { value: helper.ether(1), from: purchaser });
            const event1 = log.logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event1);
            event1.args.amount.should.be.bignumber.equal(expectedValue);
        });

        it('should reject not list pre ico investor', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, {value: helper.ether(1), from: purchaser})
            .should.be.rejectedWith(helper.EVMRevert);
        });

        it('should reject not added ico investor', async function () {
            const expectedValue = 80000e18;
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: _});
            const {logs}   = await this.mowjowCrowdsale.buyTokens(purchaser, {
                value: helper.ether(1), from: purchaser
            });
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.amount.should.be.bignumber.equal(expectedValue);
            await this.mowjowCrowdsale.buyTokens(purchaser, { value: helper.ether(1), from: purchaser })
                .should.be.rejectedWith(helper.EVMRevert);

        });

        it('should reject if investor is exists in list investors', async function () {
            const expectedValue = 80000e18;
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: _});
            const {logs}   = await this.mowjowCrowdsale.buyTokens(purchaser, {
                value: helper.ether(1), from: purchaser
            });
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            await this.mowjowCrowdsale.addMowjowInvestors(investor, true, {from: _});
            await this.mowjowCrowdsale.addMowjowInvestors(investor, true, {from: _})
                .should.be.rejectedWith(helper.EVMRevert);

        });

    })
});
