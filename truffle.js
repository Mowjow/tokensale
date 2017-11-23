var mnemonic = "easy blossom balance salute medal hamster cube satisfy hammer old dirt ski";

var HDWalletProvider = require("truffle-hdwallet-provider");


module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },    
      staging: {
        host: "localhost",
        port: 8546,
        network_id: 1337
      },
    ropsten: { 
      network_id: 3, 
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"), // Use our custom provider
      gas: 500000000,
      gasLimit: 500000,
      gasPrice: 100000//,
      //from: "0xC16Cd2dd3EA77B0eC4CdFd98ABF22013B4d33999"
    }
  } 
};
