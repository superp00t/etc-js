const cry = require("./Crypto/");
const Bn  = require("./Bn");
const hex = require("./Encoding").encodeToHex;

module.exports = function(min, max) {
  var value = cry.nacl.randomBytes(32);
  var v = hex(value);
  var bn    = new Bn(v, 'hex', 'le');
  var max   = new Bn(max);
  var range = max.sub(new Bn(min));
  return min + bn.modn(range);
}