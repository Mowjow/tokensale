var abi = require('ethereumjs-abi')
var parameterTypes = ["address[]", "uint"]; 
var parameterValues = [["0xdd870fa1b7c4700f2bd7f44238821c26f7392148","0x583031d1113ad414f02576bd6afabfb302140225","0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"],2];

var encoded = abi.rawEncode(parameterTypes, parameterValues);

console.log(encoded.toString('hex'));

