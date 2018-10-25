const {
  TextEncoder,
  TextDecoder
} = require("./Coding/Text");

const {
  encode, decode
} = require("./Coding/Base64");

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
    var s = encode(input);
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
    return decode(s);
}

exports.encodeToHex = encodeToHex;
exports.decodeFromHex = decodeFromHex;
exports.encodeToUTF8 = encodeToUTF8;
exports.encodeToBase64 = encode;
exports.decodeFromBase64 = decode;
exports.decodeFromUTF8 = decodeFromUTF8;
exports.decodeFromURL = decodeFromURL;
exports.encodeToURL = encodeToURL