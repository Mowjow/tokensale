module.paths.push('/usr/lib/node_modules');

var fs = require('fs');
const Web3 = require('web3');
const solc = require('solc')

// const contract_data = JSON.parse(
//     fs.readFileSync('./build/contracts/MultiSigMowjow.json', 'utf8')
// );

var openKey = "0xdd870fa1b7c4700f2bd7f44238821c26f7392148";
var privateKey = "bbf289d846208c16edc8474705c748aff07732db"; 

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Fetch ABI
let source = fs.readFileSync("build/contracts/MowjowCrowdsale.json");

let contracts = JSON.parse(source)["contracts"];
console.log("contracts", contracts)
let abi = JSON.parse(contracts.MowjowCrowdsale.abi);

// Get a proxy on our Ropsten contract
let SampleContract = web3.eth.contract(abi);
let contract = SampleContract.at('0xe0b79b3d705cd09435475904bf54520929eae4e8');

// Perform a transaction using ETH from the geth coinbase account
web3.personal.unlockAccount(web3.eth.coinbase, "");

// Set the account from where we perform out contract transactions
web3.eth.defaultAccount = web3.eth.coinbase;

let tx = contract.setValue(3000, {gas: 200000});
console.log("Our tx is https://testnet.etherscan.io/tx/" + tx);