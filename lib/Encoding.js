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

function validateUTF8(buf) {
  var len = buf.length;
  var i = 0;

  while (i < len) {
    if (buf[i] < 0x80) {  // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {  // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0  // overlong
      ) {
        return false;
      } else {
        i += 2;
      }
    } else if ((buf[i] & 0xf0) === 0xe0) {  // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 ||  // overlong
        buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0     // surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      } else {
        i += 3;
      }
    } else if ((buf[i] & 0xf8) === 0xf0) {  // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 ||  // overlong
        buf[i] === 0xf4 && buf[i + 1] > 0x8f || buf[i] > 0xf4  // > U+10FFFF
      ) {
        return false;
      } else {
        i += 4;
      }
    } else {
      return false;
    }
  }

  return true;
}

exports.encodeToHex = encodeToHex;
exports.decodeFromHex = decodeFromHex;
exports.encodeToUTF8 = encodeToUTF8;
exports.encodeToBase64 = encode;
exports.decodeFromBase64 = decode;
exports.decodeFromUTF8 = decodeFromUTF8;
exports.decodeFromURL = decodeFromURL;
exports.encodeToURL = encodeToURL
exports.validateUTF8 = validateUTF8;