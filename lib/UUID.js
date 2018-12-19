const decH       = require("./Encoding").decodeFromHex;
const encH       = require("./Encoding").encodeToHex;
const rand       = require("./Crypto/NaCl").randomBytes;

const rgx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function UUID(s) {
  if (s && s.constructor.name !== "String") {
    if (s.constructor.name == "Array") {
      if (s.length != 16) {
        throw new Error("bytes must be 16 long");
      }
      this.data = new Uint8Array(s);
      return;
    }

    if (s.constructor.name == "Uint8Array") {
      if (s.length != 16) {
        throw new Error("bytes must be 16 long");
      }

      this.data = s;
      return;
    }

    throw new Error("invalid constructor")
  }

  if (s) {
    s = s.toLowerCase();
    if (rgx.test(s)) {
      var el    = s.split("-");
      this.data = [];

      for (var i = 0; i < 5; i++) {
        this.data = this.data.concat(Array.from(decH(el[i])))
      }

      this.data = new Uint8Array(this.data);
    } else {
      throw new Error("not a valid UUID");
    }
  } else {
    this.data    = rand(16);
    // set version bits to 4
    this.data[6] = this.data[6] >> 4 | 0x4 << 4;
    this.data[8] = this.data[8] >> 4 | 0x8 << 4;
  }
}

UUID.prototype.toString = function() {
  return [
    encH(this.data.slice(0,  4)),
    encH(this.data.slice(4,  6)),
    encH(this.data.slice(6,  8)),
    encH(this.data.slice(8,  10)),
    encH(this.data.slice(10, 16))
  ].join("-").toLowerCase();
}

UUID.prototype.toBytes = function() {
  return this.data.slice(0, this.data.length);
}

module.exports = UUID;