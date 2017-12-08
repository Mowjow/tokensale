const config = require('../migrations/config.json');
const t = require('./helper');
const should = t.should;

contract('MowjowFunds', function ([_, fundWallet, earlyContribStrategy, preIcoStrategy, trancheStrategy, purchaser]) {

    before (async function () {
        this.startTime = t.latestTime() + t.duration.weeks(1);
        this.endTime = this.startTime + t.duration.weeks(8);

        this.preIcoStrategy = await t.PreIcoStrategy.deployed();
        this.trancheStrategy = await t.TrancheStrategy.deployed();
        const mj = await t.MowjowFunds.deployed();
        this.finalizableMowjow = await t.FinalizableMowjow.new(mj.address);

        this.earlyContribStrategy = await t.EarlyContribStrategy.new(
            config.early_contributors.bonus, config.early_contributors.token_cap,
            config.early_contributors.rate
        );

        await this.preIcoStrategy.setEndDate(this.endTime);
        await this.trancheStrategy.setEndDate(this.endTime);

        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            this.startTime, this.endTime, t.rate, fundWallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address
        );

        await this.preIcoStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.trancheStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);
        await this.earlyContribStrategy.setCrowdsaleAddress(this.mowjowCrowdsale.address);

        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
        this.val = t.ether(0.5);
    });

    describe('Deploy Funds', function () {

        it('Should deploy with fundWallet set to', async function () {
            const wallet = await this.mowjowCrowdsale.wallet();
            wallet.should.be.equal(fundWallet);

        });

        it('Should not allow update trancheStrategy', async function() {
            await this.mowjowCrowdsale.changeTrancheStrategy(trancheStrategy);
            const tranche = await this.mowjowCrowdsale.trancheStrategy();
            tranche.should.be.equal(trancheStrategy);
        });

        it('Should not allow update preIcoStrategy', async function() {
            await this.mowjowCrowdsale.changePreIcoStrategy(preIcoStrategy);
            const preIco = await this.mowjowCrowdsale.preIcoStrategy();
            preIco.should.be.equal(preIcoStrategy);
        });

        it('Should not allow update trancheStrategy', async function() {
            await this.mowjowCrowdsale.changeEarlyContribStrategy(earlyContribStrategy);
            const earlyContributorsPrice = await this.mowjowCrowdsale.earlyContribStrategy();
            earlyContributorsPrice.should.be.equal(earlyContribStrategy);
        });

        it('Should​ ​not​ allow​ ​the​ ​buyTo​​ ​function​ ​to​ ​be​ ​called​ ​to​ ​an​ ​address​ ​of​ ​0​', async function() {
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: 0}).should.be.rejectedWith(t.invalidAddress);
        });
    })
});
