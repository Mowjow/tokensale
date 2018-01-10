const helper = require('./helper');
const { setupParams, PURCHASE_EVENT } = require('./helpers/config.json');

const should = helper.should;

contract('MowjowCrowdsale', function ([_, investor, mowjowInvestor, wallet, purchaser, manager1, manager2]) {

    before(async function () {
        await helper.advanceBlock();
    });

    beforeEach(async function () {

        const [crowdsale, preIcoStrategy, finalize, token] = await helper.setupCrowdsaleSuite(
            setupParams, helper.crowdsaleParams, _, wallet
        );
        this.mowjowCrowdsale = crowdsale;
        this.token = token;
        this.finalizableMowjow = finalize;
        this.preIcoStrategy = preIcoStrategy;
    });

    describe('payments in pre ico with 100% bonuses', function () {

        it('should reject add whitelist investor no valid manager account', async function () {

            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: manager1})
                .should.be.rejectedWith(helper.EVMRevert);
        });

        it('should reject if valid manager try to add new manager', async function () {
            await this.mowjowCrowdsale.addManager(manager1, {from: _});
            await this.mowjowCrowdsale.addManager(manager2, {from: manager1})
                .should.be.rejectedWith(helper.EVMRevert);
        });

        it('should valid manager add investor', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: helper.ether(1), from: purchaser })
                .should.be.rejectedWith(helper.EVMRevert);
            await this.mowjowCrowdsale.addManager(manager1, {from: _});
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: manager1});
            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value: helper.ether(1), from: purchaser });

            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
        });

        it('should add investor to early contributor list successfully through valid manager', async function () {
            await this.mowjowCrowdsale.addEarlyContributors(investor, helper.etherValue, {from: manager1})
                .should.be.rejectedWith(helper.EVMRevert);
            await this.mowjowCrowdsale.addManager(manager1, {from: _});

            const {logs} = await this.mowjowCrowdsale.addEarlyContributors(investor, helper.etherValue, {from: manager1});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);

            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(helper.etherValue);
            event.args.amount.should.be.bignumber.equal(helper.expectedTokenAmount);
        });

        it('should add investor to mowjow investors list successfully through valid manager', async function () {
            await this.mowjowCrowdsale.buyTokens(purchaser, { value: helper.ether(1), from: purchaser })
                .should.be.rejectedWith(helper.EVMRevert);
            await this.mowjowCrowdsale.addManager(manager1, {from: _});
            const expectedValue = 80000e18;
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: manager1});
            const {logs}   = await this.mowjowCrowdsale.buyTokens(purchaser, {
                value: helper.ether(1), from: purchaser
            });
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.amount.should.be.bignumber.equal(expectedValue);
            await this.mowjowCrowdsale.buyTokens(investor, { value: helper.ether(1), from: purchaser })
                .should.be.rejectedWith(helper.EVMRevert);

            await this.mowjowCrowdsale.addMowjowInvestors(investor, {from: manager1});
            const log  = await this.mowjowCrowdsale.buyTokens(investor, { value: helper.ether(1), from: purchaser });
            const event1 = log.logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event1);
            event1.args.amount.should.be.bignumber.equal(expectedValue);
        });
    })
});
