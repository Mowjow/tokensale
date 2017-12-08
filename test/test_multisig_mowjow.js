const helper = require('./helper');
const MultiSigMowjow = artifacts.require('MultiSigMowjow');
const should = helper.should;

contract('MultiSigMowjow', function ([_, receiver, purchaser, randomAddress, ...other]) {

    before(async function () {
        await helper.advanceBlock();
        this.multiSigMowjow = await MultiSigMowjow.deployed();
        this.value = helper.ether(0.0000000000000001);
    });

    beforeEach(async function () {
        this.INVESTORS_COUNT = 5;
        this.EXECTED_REQUIRED = 5;

        this.investors = other.slice(0, this.INVESTORS_COUNT);
        this.firstInvestor = this.investors[0];
        this.lastInvestor = this.investors[this.INVESTORS_COUNT-1];

        this.multiSigMowjow = await MultiSigMowjow.new(this.investors, this.EXECTED_REQUIRED)
    });

    describe('Payments in pre ico with 100% bonuses', function () {

        it('Should success init multisig wallet with 6 owners', async function () {
            let owners = await this.multiSigMowjow.getOwners();
            let requiredConfirmations = await this.multiSigMowjow.required();
            let countOwners = await owners.length;
            countOwners.should.be.bignumber.equal(this.INVESTORS_COUNT);
            requiredConfirmations.should.be.bignumber.equal(this.EXECTED_REQUIRED);
        });

        it('Should accept payments to multisig', async function () {
            let startBalance = 0,
                expectBalance = 100,
                balance;
            balance = web3.eth.getBalance(this.multiSigMowjow.address);
            balance.should.be.bignumber.equal(startBalance);
            let { logs } = await this.multiSigMowjow.send(this.value, { from: purchaser });
            const event = logs.find(e => e.event === 'Deposit');
            should.exist(event);
            event.args.sender.should.be.bignumber.equal(_);
            event.args.value.should.be.bignumber.equal(expectBalance);
            balance = web3.eth.getBalance(this.multiSigMowjow.address);
            balance.should.be.bignumber.equal(expectBalance);
        });

        it('Should payment from multisig', async function () {


            let toSend = this.value.div(50),
                expectBalance = web3.eth.getBalance(receiver).add(toSend);

            const owners = await this.multiSigMowjow.getOwners();
            await this.multiSigMowjow.send(this.value, { from: purchaser });

            const {logs} = await this.multiSigMowjow.submitTransaction(receiver, toSend,
                "payments for test ", {from: this.firstInvestor});

            let transactionIndex = logs.find(t => "transactionIndex").transactionIndex;

            let hasConfirmed = false;

            for(let i=1; i<this.investors.length-1; i++) {
                const currentInvestor = this.investors[i];
                await this.multiSigMowjow.confirmTransaction(transactionIndex, {from: currentInvestor});
                hasConfirmed = await this.multiSigMowjow.isConfirmed(transactionIndex);
                hasConfirmed.should.be.equal(false);
            }

            await this.multiSigMowjow.confirmTransaction(transactionIndex, {from: this.lastInvestor});
            hasConfirmed = await this.multiSigMowjow.isConfirmed(transactionIndex);
            hasConfirmed.should.be.equal(true);

            const balance = web3.eth.getBalance(receiver);
            balance.should.be.bignumber.equal(expectBalance);
        });

        it('should reject with no owner address', async function () {
            await this.multiSigMowjow.send(this.value, { from: purchaser });
            await this.multiSigMowjow.submitTransaction(receiver, .00000001, "0x4bb278f3",
                {from: randomAddress}).should.be.rejectedWith(helper.EVMRevert);
        });
    })
});
