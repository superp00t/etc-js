const KURL    = require("../../KURL");

const UNSENT = 0,
      OPENED = 1,
      HEADERS_RECEIVED = 2,
      LOADING          = 3,
      DONE             = 4;

/**
 * incomplete XHR implementation
 */
function XHR() {
  this.upload  = {};
  this.headers = {};
  this.emitters = {};

  this.readyState = UNSENT;
  this.responseType = "text";
  this.chunkSize = 4096;
}

XHR.prototype.setRequestHeader = function(key, value) {
  this.headers[key.toLowerCase()] = value;
}

/**
 * 
 * @param {String} method 
 * @param {String} url 
 */
XHR.prototype.open = function (method, url) {
  this.method = method.toUpperCase();

  if ([
    "TRACE",
    "BIND",
    "CONNECT"
  ].includes(this.method)) {
    this.method = "GET";
  }

  this.url = new KURL(url)

  switch (this.url.proto) {
    case "https":
    this.api = require("https");
    break;

    case "http":
    this.api = require("http");
    break;

    default:
    throw new Error("unknown protocol: " + this.url.proto);
    break;
  }

  this.readyState = OPENED;
  this.emit("readystatechange", {});
}

XHR.prototype.addEventListener = function (evt, cb) {
  if (this.emitters[evt]) {
    this.emitters[evt].push(cb);
    return;
  }

  this.emitters[evt] = [cb];
}

XHR.prototype.emit = function (evt, data) {
  if (evt === "upload-progress") {
    if (this.upload.onprogress) {
      this.upload.onprogress(data);
    }
  }

  var possible = this["on" + evt.toLowerCase()];
  if (possible) {
    possible(data);
  }

  if (this.emitters[evt]) {
    this.emitters[evt].forEach(function(cb) {
      cb(data);
    });
  }
}

XHR.prototype.send = function (data) {
  var uploadData = null;

  var $this = this;

  console.log("Connecting to ", this.url.hostname, ":", this.url.portNumber())

  this.req = this.api.request({
    host:   this.url.hostname,
    port:   this.url.portNumber(),
    method: this.method,
    headers:this.headers,
    path:   this.url.path + this.url.encodeQuery()
  }, function(res) {
    $this.status = res.statusCode;
    $this.statusText = res.statusMessage;
    $this.readyState = HEADERS_RECEIVED;
    $this.emit("readystatechange", {});

    if (res.headers["content-length"]) {
      $this._respSize = parseInt(res.headers["content-length"]);
    }
    console.log($this._respSize);
    $this._respDownloaded = 0;

    var chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
      $this._respDownloaded += chunk.length;

      if ($this._respSize) {
        $this.emit("progress", {
          loaded: $this._respDownloaded,
          total:  $this._respSize
        });
      }
    });

    res.on("end", function () {
      $this.response = Buffer.concat(chunks);
      if ($this.responseType === "arraybuffer") {
        $this.response = $this.response.buffer.slice($this.response.byteOffset, $this.response.byteOffset + b.byteLength);
      }

      if ($this.responseType === "text") {
        $this.responseText = $this.response.toString("utf8");
      }

      $this.emit("load", {});

      $this.readyState = DONE;
      $this.emit("readystatechange", {});
    });
  });

  this.req.on("error", function(err) {
    $this.status = 0;
    $this.statusText = err.toString();
  });

  if (!(data === null || typeof data === "undefined")) {
    var out;

    if (typeof data === "string") {
      out = Buffer.from(data);
    }

    if (data.constructor.name === "Uint8Array") {
      out = new Buffer(data.length);
      for (var i = 0; i < data.length; i++) {
        out[i] = data[i];
      }
    }

    var offset = 0;
    while (offset < out.length) {
      var segment = out.slice(offset, offset+this.chunkSize);
      offset += segment.length;
      this.req.write(segment);
      this.emit("upload-progress", {
        total:  out.length,
        loaded: offset
      });
    }
  }

  this.req.end();
}

module.exports = XHR;