var mnemonic = "easy blossom balance salute medal hamster cube satisfy hammer old dirt ski";

var HDWalletProvider = require("truffle-hdwallet-provider");


module.exports = {
  networks: {
    // ropsten: {
    //   provider: function () {
    //     return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
    //   },
    //   network_id: '3',
    //   // gas: 4712388,
    //   // gasLimit: 5000000,
    //   // gasPrice: 100000000000,
    //   // from: "0xC16Cd2dd3EA77B0eC4CdFd98ABF22013B4d33999"
    // },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
  }
};
