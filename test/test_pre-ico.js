const t = require('./helper');
const should = t.should;

contract('PreIcoStrategy', function ([_, investor, wallet, purchaser]) {
    const PURCHASE_EVENT = 'Purchase';
    let val = t.value.mul(0.5);
    const expectedTokenAmount = t.rate.mul(2);

    before(async function () {
    });

    beforeEach(async function () {
       this.mowjowCrowdsale = await t.MowjowCrowdsale.deployed();
       let token = await this.mowjowCrowdsale.token();
       this.token = await t.MowjowToken.at(token);
    });

    describe('payments in pre ico for whitelist investors', function () {

        it('should add investor to whitelist successfuly and permition for invest', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor);

            const {logs} = await this.mowjowCrowdsale.buyTokens(investor, {value: val, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(val);
        });

        it('should test% bonus for  whitelist investor ', async function () {
            let v = t.value.mul(1);
            await this.mowjowCrowdsale.addWhitelistInvestors(investor);
            const {logs} = await this.mowjowCrowdsale.buyTokens(investor, {value: v, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(t.value);
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(expectedTokenAmount);
        });

        it('should reject after payment not from whitelist', async function () {
            // await this.mowjowCrowdsale.buyTokens(investor, {value: t.value, from: purchaser});
            // await this.mowjowCrowdsale.addWhitelistInvestors(investor);
            // await this.mowjowCrowdsale.buyTokens(purchaser,
            //     {value: t.value, from: purchaser}).should.be.rejectedWith(t.EVMThrow);
        })
    })
})
