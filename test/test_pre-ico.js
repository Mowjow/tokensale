const t = require('./helper');
const should = t.should;
const config = require('../migrations/config.json');

contract('PreIcoStrategy', function ([_, investor, wallet, purchaser, investor2]) {
    const PURCHASE_EVENT = 'Purchase';
    let val = t.value.mul(0.5);
    const expectedTokenAmount = t.rate.mul(2);


    before(async function () {
        await t.advanceBlock();

        // this.startTime = new Date('12-15-2024').getTime(); //1512653579
        // this.endTime = new Date('12-15-2025').getTime();
        // this.afterEndTime = new Date('12-15-2026').getTime();

        this.startTime = t.latestTime() + t.duration.weeks(1);
        this.endTime = this.startTime + t.duration.weeks(8);
        this.afterEndTime = this.endTime + t.duration.seconds(1);

        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await t.TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        const mj = await t.MowjowFunds.deployed();
        this.finalizableMowjow = await t.FinalizableMowjow.new(mj.address);

        this.earlyContribStrategy = await t.EarlyContribStrategy.new(
            config.early_contributors.bonus, config.early_contributors.token_cap,
            config.early_contributors.rate
        );

        await this.preIcoStrategy.setEndDate(this.endTime);
        await this.trancheStrategy.setEndDate(this.endTime);

        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            this.startTime, this.endTime, t.rate, wallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address
        );

        await this.preIcoStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.trancheStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.earlyContribStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        this.token = t.MowjowToken.at(await this.mowjowCrowdsale.token());
    });

    describe('payments in pre ico for whitelist investors', function () {

        it('should add investor to whitelist successfully and permission for invest', async function () {
            const res = await this.mowjowCrowdsale.addWhitelistInvestors(investor);
            const {logs} = await this.mowjowCrowdsale.buyTokens(investor, {value: val, from: purchaser});
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(val);
        });

        it('should test % bonus for  whitelist investor ', async function () {
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
