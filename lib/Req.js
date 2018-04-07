const KURL            = require("./KURL");
const enc             = require("./Encoding");
const _XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/**
 * @typedef  {Object}            ReqOpts
 * @property {string}            method
 * @property {string}            url
 * @property {Uint8Array|string} payload
 */

 /**
  * @class
  * @param {ReqOpts} o
  */
function Req(o) {
  this.method   = o.method;
  this.url      = o.url;
  this.payload  = o.payload  || null;
  this.respType = o.respType || "text";

  var normType = {
    "buffer": "arraybuffer",
    "text": "text",
    "json": "text"
  };

  if (normType[this.respType] == undefined) {
    throw new Error("Invalid respType: " + this.respType);
    return;
  }

  this.req = new _XMLHttpRequest();
  this.req.open(this.method, this.url);
  this.reqType = "xhr";
  this.req.responseType = normType[this.respType];
}

/**
 * @typedef  {Object}                    ReqResponse
 * @property {string}                    status
 * @property {Uint8Array|string|Object}  data
 */

/**
 * Perform the HTTP request.
 * 
 * @return {Promise<ReqResponse>}
 */
Req.prototype.do = function () {
  var _this = this;
  return new Promise(function (y, n) {
    if (_this.reqType == "xhr") {
      _this.req.onreadystatechange = function () {
        console.log(_this.req.readyState);
        if (_this.req.readyState == 4) {
          if (_this.respType == "json") {
            y({
              status: _this.req.status,
              data: JSON.parse(_this.req.responseText)
            });
            return;
          }

          if (_this.respType == "buffer") {
            y({
              status: _this.req.status,
              data: new Uint8Array(_this.req_response)
            });
            return;
          }


          if (_this.respType == "text") {
            y({
              status: _this.req.status,
              data: _this.req.responseText
            });
            return;
          }
        }
      }

      _this.req.send(_this.payload);
    }
  });
}

module.exports = Req;