const h = require("./HMAC");

module.exports = {
  hmac: h.hmac,
  auth: h.auth,
  nacl: require("./NaCl")
};