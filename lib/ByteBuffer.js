const nacl = require("./Crypto/NaCl");
const Bn   = require("./Bn");
const UUID = require("./UUID");
const enc  = require("./Encoding");

const cpy = (src,dest,destOffset) => {
  var o = 0 || destOffset;

  for (var i = 0; i < src.length; i++) {
    var _do = o + i;
    dest[_do] = src[i];
  }
}

/**
 * 
 * @param {null | Uint8Array | ArrayBuffer} c 
 */
function ByteBuffer(c) {
  this.r = 0;
  this.w = 0;

  if (c !== undefined) {
    var cname = c.constructor.name;
    if (cname === "Uint8Array") {
      c = Array.from(c);
    }

    if (cname === "ArrayBuffer") {
      c = Array.from(new Uint8Array(cname));
    }
  }

  this.data = (c !== undefined) ? Uint8Array.from(c) : new Uint8Array(0);
}

ByteBuffer.fromURL = function(str) {
  var bytes = enc.decodeFromURL(str);
  return new ByteBuffer(bytes);
}

/**
 * Get buffer length.
 * 
 * @return {Number}
 */
ByteBuffer.prototype.len = function() {
  return this.data.length;
}

/**
 * Read a subsection of the buffer.
 * 
 * @param  {Number}    i the length of the array to return.
 * @return {Uint8Array} 
 */
ByteBuffer.prototype.readBytes = function(i) {
  var d = new Uint8Array(i)
  for (var x = 0; x < i; x++) {
    d[x] = this.readByte();
  }
  return d;
}

/**
 * (Legacy Protocols)
 * 
 * Read a string from fixed memory sector (this.r:this.r + i);
 * Some protocols do this (I wouldn't recommend using this unless you really know what you're doing.)
 */
ByteBuffer.prototype.readFixedString = function(i) {
  var e = new ByteBuffer(this.readBytes(i));
  return e.readCString();
}

/**
 * (Legacy Protocols)
 * 
 * Write a string into a fixed memory sector (this.w:this.w + i);
 * Some protocols do this (I wouldn't recommend using this unless you really know what you're doing.)
 */
ByteBuffer.prototype.writeFixedString = function(s,i) {
  // s := example "Turnip"
  // i := example 9
  // then wt == [ 0,   0,   0,   0,   0,   0,  0, 0, 0]
  var wt = new Uint8Array(i);
  var _in = enc.decodeFromUTF8(s);
  cpy(_in,wt,0);
  // then wt == ['T', 'u', 'r', 'n', 'i', 'p', 0, 0, 0]

  this.writeBytes(wt);
}

/**
 * Read a dynamically sized byte array. The buffer stores the length of this array as a varint, so no need to supply a length argument. 
 *
 * @return {Uint8Array}
 */
ByteBuffer.prototype.readLimitedBytes = function() {
  var ln = this.readUnsignedVarint().toNumber();
  return this.readBytes(ln);
}


/**
 * Write bytes along with length data
 * 
 * @param {Uint8Array} d 
 */
ByteBuffer.prototype.writeLimitedBytes = function(d) {
  this.writeUnsignedVarint(new Bn(d.length));
  this.writeBytes(d);
}

/**
 * write bytes with pre-known length
 * 
 * @param {Uint8Array} d 
 */
ByteBuffer.prototype.writeBytes = function(d) {
  for (var x = 0; x < d.length; x++) {
    this.writeByte(d[x]);
  }
}

/**
 * Get URL encoded base64 string
 * 
 * @return {String}
 */
ByteBuffer.prototype.toURL = function() {
  return enc.encodeToURL(this.finish());
}

/**
 * read singular byte
 * 
 * @return {Number}
 */
ByteBuffer.prototype.readByte = function() {
  var b = this.data[this.r];  
  this.r++;
  if (b == undefined) {
    return 0;
  }
  return b;
}

/**
 * 
 * @param {Number} i 
 */
ByteBuffer.prototype.writeByte = function(i) {
  var prev = this.data;
  this.data = new Uint8Array(prev.length + 1);
  this.data.set(prev, 0);
  this.data.set(new Uint8Array([i]), prev.length);
  this.w++;
}

/**
 * Get SHA-512 digest of buffer
 * 
 * @return {Uint8Array}
 */
ByteBuffer.prototype.digest = function() {
  return nacl.hash(this.finish());
}

ByteBuffer.prototype.writeUUID = function(u) {
  this.writeBytes(u.toBytes());
}

ByteBuffer.prototype.readUUID = function() {
  return new UUID(this.readBytes(16));
}

/**
 * Convert Buffer to
 * 
 * @return {String}
 */
ByteBuffer.prototype.finishAsString = function() {
  return enc.encodeToUTF8(this.finish());
}

/**
 * Write UTF8 string to buffer, with length prepended as a varint
 * 
 * @param {String} s 
 */
ByteBuffer.prototype.writeString = function(s) {
  return this.writeUTF8(s);
}

/**
 * Read varint-delimited UTF8 string from buffer
 * 
 * @return {String}
 */
ByteBuffer.prototype.readString = function() {
  return this.readUTF8();
}
/**
 * Write NULL-terminated UTF8 string to buffer
 * 
 * @param {String} s 
 */
ByteBuffer.prototype.writeCString = function(s) {
  var a = enc.decodeFromUTF8(s);
  this.writeBytes(a);
  this.writeByte(0);
}

/**
 * Read NULL-terminated UTF8 string from buffer
 * 
 * @return {String}
 */
ByteBuffer.prototype.readCString = function() {
  var s = "";
  for (; ;) {
    var b = this.readByte();
    if (b == 0) {
      break;
    }
    s += String.fromCharCode(b);
  }
  return s;
}

/**
 * Write Date
 * 
 * @param {Date} d
 */
ByteBuffer.prototype.writeDate = function(d) {
  this.writeUint(d.getTime());
} 

/**
 * Read Date
 * 
 * @return {Date}
 */
ByteBuffer.prototype.readDate = function() {
  return new Date(this.readUint());
}

/**
 * Get finished buffer as Uint8Array
 * 
 * @return {Uint8Array}
 */
ByteBuffer.prototype.finish = function() {
  var out = new Uint8Array(this.data);
  return out;
}

/**
 * Retrieve subsection of buffer
 * 
 * @param  {Number} s 
 * @param  {Number} e 
 * @return {Uint8Array}
 */
ByteBuffer.prototype.slice = function(s,e) {
  return this.data.slice(s,e);
}

/**
 * Get all bytes that can be read.
 * 
 * @return {Uint8Array}
 */
ByteBuffer.prototype.remainingBytes = function() {
  return this.slice(this.r, this.len());
}

/**
 * Write unsigned Bn with LEB128
 * 
 * @param {Bn} num 
 */
ByteBuffer.prototype.writeUnsignedVarint = function(num) {
  if (num.constructor.name !== "Bn") {
    num = new Bn(num);
  }

  while(true) {
    const i = num.maskn(7).toNumber();

    num.ishrn(7);

    if (num.isZero()) {
      this.writeBytes(new Uint8Array([i]));
      break;
    } else {
      this.writeBytes(new Uint8Array([i | 0x80]));
    }
  }
}

/**
 * Decode unsigned Bn with LEB128
 * 
 * @return {Bn}
 */
ByteBuffer.prototype.readUnsignedVarint = function() {
  const num = new Bn(0);
  var shift = 0;
  var byt;

  while(true) {
    byt = this.readByte();
    num.ior(new Bn(byt & 0x7F).shln(shift));

    if (byt >> 7 == 0) {
      break;
    } else {
      shift += 7;
    }
  }

  return num;
}

/**
 * Decode signed Bn with LEB128
 * 
 * @return {Bn}
 */
ByteBuffer.prototype.readSignedVarint = function() {
  const num = new Bn(0);
  var shift = 0;
  var byt;

  while(true) {
    byt = this.readByte();
    num.ior(new Bn(byt & 0x7F).shln(shift));
    shift += 7;
    if (byt >> 7 == 0) {
      break;
    }
  }

  if (byt & 0x40) {
    num.setn(shift);
  }

  return num.fromTwos(shift);
}

/**
 * Write signed Bn with LEB128
 * 
 * @param {Bn} num 
 */
ByteBuffer.prototype.writeSignedVarint = function(num) {
  const isNeg = num.isNeg()
  if (isNeg) {
    // add 8 bits for padding
    num = num.toTwos(num.bitLength() + 8)
  }

  while(true) {
    const i = num.maskn(7).toNumber();

    num.ishrn(7);

    if ((isNegOne(num) && (i & 0x40) !== 0) ||
    (num.isZero() && (i & 0x40) === 0)) {
      this.writeBytes(new Uint8Array([i]));
      break;
    } else {
      this.writeBytes(new Uint8Array([i | 0x80]));
    }
  }

  function isNegOne (num) {
    return isNeg && num.toString(2).indexOf('0') < 0
  }
}

/**
 * Write 32-bit floating point number to buffer.
 * 
 * @param {Number} i 
 */
ByteBuffer.prototype.writeFloat32 = function (i) {
  var buffer = new Uint8Array(4);
  var floatView = new Float32Array(buffer.buffer);
  
  floatView[0] = i;
  this.writeBytes(buffer);
}

/**
 * Write 64-bit floating point number to buffer.
 * 
 * @param {Number} i 
 */
ByteBuffer.prototype.writeFloat64 = function (i) {
  var buffer = new Uint8Array(8);
  var floatView = new Float64Array(buffer.buffer);
  floatView[0] = i;
  this.writeBytes(buffer);
}

/**
 * Read 32-bit floating point number from buffer.
 * 
 * @return {Number}
 */
ByteBuffer.prototype.readFloat32 = function () {
  var buffer = this.readBytes(4);
  var floatView = new Float32Array(buffer.buffer);
  return floatView[0];
}

/**
 * Read 64-bit floating point number from buffer.
 * 
 * @return {Number}
 */
ByteBuffer.prototype.readFloat64 = function () {
  var buffer = this.readBytes(8);
  var floatView = new Float64Array(buffer.buffer);
  return floatView[0];
}

/**
 * @return {Number}
 */
ByteBuffer.prototype.readInt = function() {
  var ret = 0;
  try {
    ret = this.readSignedVarint().toNumber();
  } catch (e) {
    return 0;
  }

  return ret;
}

/**
 * @param {Number} v
 */
ByteBuffer.prototype.writeInt = function(v) {
  return this.writeSignedVarint(new Bn(v));
}

/**
 * @return {Number}
 */
ByteBuffer.prototype.readUint = function() {
  var ret = 0;
  try {
    ret = this.readUnsignedVarint().toNumber();
  } catch (e) {
    return 0;
  }

  return ret;
}

/**
 * @param {Number} v
 */
ByteBuffer.prototype.writeUint = function(v) {
  return this.writeUnsignedVarint(new Bn(v));
}

/**
 * @return {String}
 */
ByteBuffer.prototype.readUTF8 = function() {
  var ln = this.readUint();
  var bs = this.readBytes(ln);

  return enc.encodeToUTF8(bs);
}

/**
 * @param {String}
 */
ByteBuffer.prototype.writeUTF8 = function(str) {
  var by = enc.decodeFromUTF8(str);
  this.writeUint(by.length);
  this.writeBytes(by);
}


module.exports = ByteBuffer;