const expectThrow = require('./helpers/expectThrow');
const MowjowToken = artifacts.require('./MowjowToken.sol');
const helper = require('./helper');
const should = helper.should;

const tokenParams = {
    name: 'SomeToken',
    symbol: 'Symb',
    decimals: 18,
    initial_supply: 1
};

contract('MowjowToken', function ([_, investor, wallet, purchaser, ownerPauseStatement]) {

    beforeEach(async function () {
        await helper.advanceBlock();
        this.token = await MowjowToken.new(tokenParams.name, tokenParams.symbol,
            tokenParams.decimals, tokenParams.initial_supply);
        await this.token.setOwnerPauseStatement(ownerPauseStatement, {from: _});
        this.ownerPause = await this.token.ownerPauseStatement();
    });

    it('should start with correct params', async function () {

        const name = await this.token.name(),
            symbol = await this.token.symbol(),
            decimals = await this.token.decimals();

        assert.equal(name, tokenParams.name);
        assert.equal(symbol, tokenParams.symbol);
        assert.equal(decimals, tokenParams.decimals);
    });

    it('should return mintingFinished false after construction', async function () {
        let mintingFinished = await this.token.mintingFinished();

        assert.equal(mintingFinished, false);
    });

    it('should mint a given amount of tokens to a given address', async function () {
        const result = await this.token.mint(investor, 100);
        assert.equal(result.logs[0].event, 'Mint');
        assert.equal(result.logs[0].args.to.valueOf(), investor);
        assert.equal(result.logs[0].args.amount.valueOf(), 100);
        assert.equal(result.logs[1].event, 'Transfer');
        assert.equal(result.logs[1].args.from.valueOf(), 0x0);

        let balance0 = await this.token.balanceOf(investor);
        assert.equal(balance0, 100);

        let totalSupply = await this.token.totalSupply();
        assert.equal(totalSupply, 100);
    });

    it('should fail to mint after call to finishMinting', async function () {
        await this.token.finishMinting();
        assert.equal(await this.token.mintingFinished(), true);
        await expectThrow(this.token.mint(investor, 100)).should.be.rejectedWith(helper.EVMRevert);
    });

    it('should fail to transfer after set halt statement', async function () {
        const result = await this.token.mint(investor, 100);

        await this.token.halt({from: this.ownerPause});
        await expectThrow(this.token.transfer(investor, 100, {from: investor}))
            .should.be.rejectedWith(helper.EVMRevert);
    });

    it('should fail to transferFrom after set halt statement', async function () {
        await this.token.mint(investor, 100);
        await this.token.halt({from: this.ownerPause});
        let balanceInvestor = await this.token.balanceOf(investor);
        balanceInvestor.should.be.bignumber.equal(100);
        await expectThrow(this.token.transferFrom(investor, purchaser, 100, {from: investor}))
            .should.be.rejectedWith(helper.EVMRevert);
    });

    it('should not to transfer after set halt statement and can transfer after unhalt statement', async function () {
        await this.token.mint(investor, 10);
        await this.token.changeStatusFinalized({from: _});
        await this.token.halt({from: this.ownerPause});
        await expectThrow(this.token.transfer(investor, 10, {from: investor}))
            .should.be.rejectedWith(helper.EVMRevert);
        await this.token.unhalt({from: this.ownerPause});
        let statePaused = await this.token.halted();
        assert.equal(statePaused, false);
        let balanceInvestor = await this.token.balanceOf(investor);
        balanceInvestor.should.be.bignumber.equal(10);
        await this.token.transfer(purchaser, 10, {from: investor});
        let balancePurchaser = await this.token.balanceOf(purchaser);
        balancePurchaser.should.be.bignumber.equal(10);

    });

    it('should manage pausable statement', async function () {
        let statePaused = await this.token.halted();
        assert.equal(statePaused, false);
        await this.token.halt({from: this.ownerPause});
        statePaused = await this.token.halted();
        assert.equal(statePaused, true);
        await this.token.unhalt({from: this.ownerPause});
        statePaused = await this.token.halted();
        assert.equal(statePaused, false);
    });

});
