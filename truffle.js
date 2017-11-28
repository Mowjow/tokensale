var mnemonic = "easy blossom balance salute medal hamster cube satisfy hammer old dirt ski";

var HDWalletProvider = require("truffle-hdwallet-provider");


module.exports = {
  networks: {
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
      },
      network_id: '3',
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
  }
};
