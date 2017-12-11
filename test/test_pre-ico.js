const helper = require('./helper');
const { setupParams, PURCHASE_EVENT } = require('./helpers/config.json');

const should = helper.should;

contract('PreIcoStrategy', function ([_, investor, wallet, purchaser]) {

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

    describe('payments in pre ico for whitelist investors', function () {

        it('should add investor to whitelist successfully and permission for invest', async function () {
            let val = helper.ether(1).mul(0.5);
            await this.mowjowCrowdsale.addWhitelistInvestors(investor);
            const {logs} = await this.mowjowCrowdsale.buyTokens(investor, {value: val, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(val);
        });

        it('should test % bonus for  whitelist investor ', async function () {
            let fundValue = helper.ether(1);
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser);

            const {logs} = await this.mowjowCrowdsale.buyTokens(purchaser, {value: fundValue, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(purchaser);
            event.args.value.should.be.bignumber.equal(fundValue);
            event.args.amount.should.be.bignumber.equal(helper.expectedTokenAmountPreIco);

            const balance = await this.token.balanceOf(purchaser);
            balance.should.be.bignumber.equal(helper.expectedTokenAmountPreIco);
        });
    })

});
