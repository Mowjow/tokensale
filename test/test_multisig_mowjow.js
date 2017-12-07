const t = require('./helper');
const should = t.should;

contract('MultiSigMowjow', function ([_, investor1, investor2, investor3, investor4, investor5, investor6, purchaser, resiver, noOvner]) {
     const value = t.ether(0.0000000000000001);

    beforeEach(async function () {
        await t.advanceBlock();
        this.multiSigMowjow = await t.MultiSigMowjow.deployed();
    });

    describe('payments in pre ico with 100% bonuses', function () {

        it('should success init multisig wallet with 6 owners', async function () {
            const expectedRequired = 4;
            let multiSig = await t.MultiSigMowjow.new([investor1, investor2, investor3, investor4, investor5, investor6], expectedRequired);
            let owners = await multiSig.getOwners();
            let requiredConfirmations = await multiSig.required();
            let countOwners = await owners.length;
            countOwners.should.be.bignumber.equal(6);
            requiredConfirmations.should.be.bignumber.equal(expectedRequired);
        });

        it('should accept payments to multisig', async function () {
            let startBalance = 0,
                expectBalance = 100,
                balance;
            balance = web3.eth.getBalance(this.multiSigMowjow.address);
            balance.should.be.bignumber.equal(startBalance);
            let { logs } = await this.multiSigMowjow.send(value, { from: purchaser });
            const event = logs.find(e => e.event === 'Deposit');
            should.exist(event);
            event.args.sender.should.be.bignumber.equal(_);
            event.args.value.should.be.bignumber.equal(expectBalance);
            balance = web3.eth.getBalance(this.multiSigMowjow.address);
            balance.should.be.bignumber.equal(expectBalance);
        });

        it('should payment from multisig', async function () {
            let valueForsend = value.div(50),
                balance,
                expectBalance = web3.eth.getBalance(resiver).add(valueForsend);

            await this.multiSigMowjow.send(value, { from: purchaser });
            const {logs} = await this.multiSigMowjow.submitTransaction(resiver, valueForsend,
                "payments for test ", {from: investor1});
            let ind = logs.find(t =>"transactionIndex");
            await this.multiSigMowjow.confirmTransaction(ind.transactionIndex, {from: investor2});
            hasConfirmed = await this.multiSigMowjow.isConfirmed(ind.transactionIndex);
            hasConfirmed.should.be.equal(false);
            await this.multiSigMowjow.confirmTransaction(ind.transactionIndex, {from: investor3});
            hasConfirmed = await this.multiSigMowjow.isConfirmed(ind.transactionIndex);
            hasConfirmed.should.be.equal(false);
            await this.multiSigMowjow.confirmTransaction(ind.transactionIndex, {from: investor4});
            hasConfirmed = await this.multiSigMowjow.isConfirmed(ind.transactionIndex);
            hasConfirmed.should.be.equal(true);
            balance = web3.eth.getBalance(resiver);
            balance.should.be.bignumber.equal(expectBalance);

        });

        it('should reject with no owner address', async function () {
            await this.multiSigMowjow.send(value, { from: purchaser });
            await this.multiSigMowjow.submitTransaction(resiver, .00000001, "0x4bb278f3",
                {from: noOvner}).should.be.rejectedWith(t.EVMRevert);
        });
    })
});
