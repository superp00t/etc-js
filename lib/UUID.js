const ByteBuffer = require("./ByteBuffer");
const decH       = require("./Encoding").decodeFromHex;
const encH       = require("./Encoding").encodeToHex;
const rand       = require("./Crypto/NaCl").randomBytes;

const rgx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function UUID(s) {
  var array = false;
  if (s) {
    if (s.constructor.name == "Array") {
      if (s.length != 16) {
        throw new Error("bytes must be 16 long");
      }
      array = true;
    }

    if (s.constructor.name == "Uint8Array" && s.length == 16) {
      this.data = s;
    }
  }

  if (array) {
    this.data = new Uint8Array(s);
    return;
  }

  if (s) {
    s = s.toLowerCase();
    if (rgx.test(s)) {
      var el    = s.split("-");
      var data  = new ByteBuffer();
      data.writeBytes(decH(el[0]));
      data.writeBytes(decH(el[1]));
      data.writeBytes(decH(el[2]));
      data.writeBytes(decH(el[3]));
      data.writeBytes(decH(el[4]));
      this.data = data.finish();
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