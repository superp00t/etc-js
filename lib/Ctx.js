const ByteBuffer = require("./ByteBuffer");
const Bn = require("./Bn");

function Ctx() {
  this.t = {
    "uint":   ["readUnsignedVarint","writeUnsignedVarint" ],
    "uint16": ["readUint16","writeUint16"],
    "uint32": ["readUint32","writeUint32"],
    "uint64": ["readUint64","writeUint64"],
    "int16": ["readInt16","writeInt16"],
    "int32": ["readInt32","writeInt32"],
    "int64": ["readInt64","writeInt64"],
    "float32":["readFloat32", "writeFloat32"],
    "float64":["readFloat64", "writeFloat64"],
    "string": ["readString", "writeString"]
  };
}

Ctx.prototype.registerStruct = function(k, v) {
  // validate v members
  this.t[k] = { type: "message", structName: k, format: v };
}

Ctx.prototype.encodeStruct = function(type, message) {
  var b = new ByteBuffer();
  this.encode(b, type, message);
  return b.finish();
}

Ctx.prototype.decodeStruct = function(type, message) {
  var b = new ByteBuffer(message);
  var strct = this.decode(b, type);
  return strct;
}

Ctx.prototype.decode = function(b, type) {
  if (this.t[type] == undefined) {
    throw new Error("Type not found: "+ type);
  }

  var tp = this.type(type);
  
  if (tp.type == "fundamental") {
    return b[tp.fType[0]]();
  }

  var keys = Object.keys(tp.format);
  var out = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var c   = tp.format[key];
    if (c.type == "array") {
      var len = b.readUnsignedVarint().toNumber();
      var outArr = new Array(len);
      for (var i = 0; i < len; i++) {
        outArr[i] = this.decode(b, c.fType);
      }
      out[key] = outArr;
    } else {
      out[key] = this.decode(b, c.kType);
    }
  }

  return out;
}

Ctx.prototype.encode = function(b, type, message) {
  if (this.t[type] == undefined) {
    throw new Error("Type not found: "+ type);
  }

  var tp = this.type(type);

  if (tp.type == "fundamental") {
    console.log(tp.fType[1])
    b[tp.fType[1]](message);
    return;
  }

  var keys = Object.keys(tp.format);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var c   = tp.format[key];
      if (c.type == "array") {
        b.writeUnsignedVarint(new Bn(message[key].length));
        for (var i = 0; i < message[key].length; i++) {
          this.encode(b, c.fType, message[key][i])
        }
      } else {
        this.encode(b, c.kType, message[key]);
      }
  }
}

Ctx.prototype.type = function(k) {
  if (this.t[k].constructor.name == "Array") {
    return {
      type: "fundamental",
      kType: k,
      fType: this.t[k]
    };
  } else {
    return this.t[k];
  }
}

Ctx.prototype.array = function(k, fixed) {
  return {
    type: "array",
    fType: k
  }
}

module.exports = Ctx;