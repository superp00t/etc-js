"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function encodeToBase64(input) {
    var i, s = [], len = input.length;
    for (i = 0; i < len; i++)
        s.push(String.fromCharCode(input[i]));
    return btoa(s.join(''));
}

function decodeFromBase64(input) {
    var i, d = atob(input), b = new Uint8Array(d.length);
    for (i = 0; i < d.length; i++)
        b[i] = d.charCodeAt(i);
    return b;
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
    var i, s = [];
    for (i = 0; i < arr.length; i++)
        s.push(String.fromCharCode(arr[i]));
    return decodeURIComponent(window["escape"](s.join('')));
}

function decodeFromUTF8(s) {
    if (typeof s !== 'string')
        throw new TypeError('expected string');
    var i, d = window["unescape"](encodeURIComponent(s)), b = new Uint8Array(d.length);
    for (i = 0; i < d.length; i++)
        b[i] = d.charCodeAt(i);
    return b;
}

exports.encodeToHex = encodeToHex;
exports.decodeFromHex = decodeFromHex;
exports.encodeToUTF8 = encodeToUTF8;
exports.encodeToBase64 = encodeToBase64;
exports.decodeFromUTF8 = decodeFromUTF8;
exports.decodeFromBase64 = decodeFromBase64;
