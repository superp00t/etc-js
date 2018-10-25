const {
  TextEncoder,
  TextDecoder
} = require("./Coding/Text");

var browserCodec = {
  e: function(input) {
    var i, s = [], len = input.length;
    for (i = 0; i < len; i++) {
        s.push(String.fromCharCode(input[i]));
    }
    return btoa(s.join(''));
  },

  d: function(input) {
    if (input == undefined || input.length == 0) {
        return new Uint8Array([]);
    }
    var i, d = atob(input), b = new Uint8Array(d.length);
    for (i = 0; i < d.length; i++) {
        b[i] = d.charCodeAt(i);
    }
    return b;
 }
}

var nodeCodec = {
    e: function(input) {
        return new Buffer(input).toString("base64");
    },

    d: function(input) {
        return new Uint8Array(new Buffer(input, "base64"))
    }
}

var encodeToBase64, decodeFromBase64;

if (typeof Buffer !== "undefined") {
    encodeToBase64 = nodeCodec.e;
    decodeFromBase64 = nodeCodec.d;
} else {
    encodeToBase64 = browserCodec.e;
    decodeFromBase64 = browserCodec.d;
}

function encodeToHex(input) {
    if (!input) {
        return '';
    }
    var hexStr = '';
    for (var i = 0; i < input.length; i++) {
        var hex = (input[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }
    return hexStr.toUpperCase();
}

function decodeFromHex(input) {
    var string = input;
    var bytes = new Uint8Array(Math.ceil(string.length / 2));
    for (var i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(string.substr(i * 2, 2), 16);
    return bytes;
}

function encodeToUTF8(arr) {
    return new TextDecoder().decode(arr);
}

function decodeFromUTF8(s) {
    return new TextEncoder().encode(s);
}

function encodeToURL(input) {
    var s = encodeToBase64(input);
    return s.split("").map((c) => {
        switch (c) {
            case '+': return '.';
            case '=': return '-';
            case '/': return '_';
            default: return c;
          }
    }).join("");
}

function decodeFromURL(input) {
    if (input == undefined || input.length == 0) {
        return new Uint8Array([]);
    }
    var s = input.split("").map((c) => {
        switch (c) {
            case '.': return '+';
            case '-': return '=';
            case '_': return '/';
            default: return c;
        }
    }).join("");
    return decodeFromBase64(s);
}


exports.encodeToHex = encodeToHex;
exports.decodeFromHex = decodeFromHex;
exports.encodeToUTF8 = encodeToUTF8;
exports.encodeToBase64 = encodeToBase64;
exports.decodeFromUTF8 = decodeFromUTF8;
exports.decodeFromBase64 = decodeFromBase64;
exports.decodeFromURL = decodeFromURL;
exports.encodeToURL = encodeToURL