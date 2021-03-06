const KURL            = require("./KURL");
const enc             = require("./Encoding");
const _XMLHttpRequest = require("./Net/XHR");

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
  this.respType = o.respType || "buffer";

  this.onDownloadProgress = o.onDownloadProgress;
  this.onUploadProgress = o.onUploadProgress;

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
  var $this = this;
  return new Promise(function (y, n) {
    if ($this.reqType == "xhr") {
      if ($this.onUploadProgress) {
        $this.req.upload.onprogress = $this.onUploadProgress;
      }

      if ($this.onDownloadProgress) {
        $this.req.onprogress = $this.onDownloadProgress;
      }

      $this.req.onreadystatechange = function () {
        if ($this.req.readyState == 4) {
          if ($this.respType == "json") {
            y({
              status: $this.req.status,
              data: JSON.parse($this.req.responseText)
            });
            return;
          }

          if ($this.respType == "buffer") {
            y({
              status: $this.req.status,
              data: new Uint8Array($this.req.response)
            });
            return;
          }
          
          if ($this.respType == "text") {
            y({
              status: $this.req.status,
              data: $this.req.responseText
            });
            return;
          }
        }
      }

      $this.req.send($this.payload);
    }
  });
}

module.exports = Req; 