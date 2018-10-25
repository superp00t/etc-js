const Buffer = require("buffer").Buffer;

module.exports = {
  encode: function(input) {
    return new Buffer(input).toString("base64");
  },

  decode: function(input) {
    return new Uint8Array(new Buffer(input, "base64"))
  }
}