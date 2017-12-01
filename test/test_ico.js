const t = require('./helper');

const should = t.should;

contract('MowjowCrowdsaleIco', function ([_, investor, wallet, purchaser]) {

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await t.advanceBlock();
    });

    beforeEach(async function () {
        this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
        this.val = t.value.mul(0.5);
    });

    describe('payments in pre ico with 100% bonuses', function () {
        beforeEach(async function () {
        });

        it('should investor pay in pre ico tranche and first ico', async function () {

            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value: this.val, from: purchaser });

            const event = logs.find(e => e.event === 'Purchase');
            should.exist(event);
        });

        it('should 100% bonus in second tranche', async function () {
            const expectedValue = 80000;
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            const logs   = await this.mowjowCrowdsale.buyTokens(investor, { value: t.value, from: purchaser });
            let balance = await this.token.balanceOf(investor);
            await this.mowjowCrowdsale.buyTokens(investor, { value: t.value, from: purchaser });
            balance = await this.token.balanceOf(investor);
            const event = logs.logs.find(e => e.event === 'Purchase');
            should.exist(event);
            event.args.amount.should.be.bignumber.equal(expectedValue);
        })
    })
});
