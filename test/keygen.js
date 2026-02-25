const crypto = require("crypto");
const fs = require("fs");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",     
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",      
    format: "pem",
  },
});

fs.writeFileSync("publickey.txt", publicKey);
fs.writeFileSync("privatekey.txt", privateKey);

console.log(publicKey);