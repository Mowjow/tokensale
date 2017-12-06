const t = require('./helper');
const should = t.should;

contract('PreIcoStrategy', function ([_, investor, wallet, purchaser, investor2]) {
    const PURCHASE_EVENT = 'Purchase';
    let val = t.value.mul(0.5);
    const expectedTokenAmount = t.rate.mul(2);

    before(async function () {
    });

    beforeEach(async function () {
        this.earlyContribStrategy = await t.EarlyContribStrategy.deployed();
        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        await this.preIcoStrategy.setEndDate(t.endTime);
        this.trancheStrategy = await t.TrancheStrategy.new([100], [80000], [40000]);
        await this.trancheStrategy.setEndDate(t.endTime);
        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            t.startTime, t.endTime, t.rate, wallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, t.finalizableMowjow.address);
        await this.trancheStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.preIcoStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.earlyContribStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
    });

    describe('payments in pre ico for whitelist investors', function () {

        it('should add investor to whitelist successfully and permission for invest', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor);

            const {logs} = await this.mowjowCrowdsale.buyTokens(investor, {value: val, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(val);
        });

        it('should test% bonus for  whitelist investor ', async function () {
            let v = t.value.mul(1);
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser);
            const {logs} = await this.mowjowCrowdsale.buyTokens(purchaser, {value: v, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(purchaser);
            event.args.value.should.be.bignumber.equal(t.value);
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
            const balance = await this.token.balanceOf(purchaser);
            balance.should.be.bignumber.equal(expectedTokenAmount);
        });
    })

});
