/**
 * Decode an encoded query string
 * 
 * @param  {String} input
 * @return {Object} 
 */
function parseQuery(input) {
  var params = input.split("&");
  var q      = {};

  for (var i = 0; i < params.length; i++) {
    var p  = params[i];
    var kv = p.split("=");

    /* Omitted value 
    /* Example: ?stuff */
    if (kv.length == 1) {
      q[p] = true;
      continue;
    };

    q[kv[0]] = unescape(kv[1]);
  }

  return q;
}

/**
 * Encode an object into a query string
 * 
 * @param  {Object} obj
 * @return {String} 
 */
function encodeQuery(obj) {
  var out  = "";
  var keys = Object.keys(obj);

  if (keys.length == 0) {
    return "";
  }

  out += "?";

  var start = false;

  for (var i = 0; i < keys.length; i++) {
    if (start) {
      out += "&";
    }

    out += keys[i];
    out += "=";
    out += encodeURIComponent(obj[keys[i]]);

    if (!start) {
      start = true;
    }
  }

  return out;
}

/**
 * 
 * @param  {String} str
 * @return {KURL} 
 */
function KURL(str) {
  this.src = str;

  this.proto    = str.split(":")[0];
  this.resource = str.split("://")[1];
  this.host     = this.resource.split("/")[0];
  
  // If port exists, use it
  if (this.host) {
    var p = this.host.split(":");
    if (p.length == 2) {
      this.hostname = p[0];
      this.port     = p[1];
    } else {
      this.hostname = this.host;
    }
  }

  this.path     = this.resource.split(this.host)[1];

  var q = this.path.split("?");
  this.path = q[0];
  this.query = {};
  if (q.length == 2) {
    this.query = parseQuery(q[1]);
  }
}

/**
 * @return {String}
 */
KURL.prototype.toString = function() {
  return [   this.proto
           , "://"
           , this.hostname
           , this.portString()
           , this.path
           , this.encodeQuery()
         ].join("");
}

KURL.prototype.encodeQuery = function() {
  return encodeQuery(this.query);
}

/**
 * @return {String}
 */
KURL.prototype.portString = function() {
  if (this.port) {
    return ":" + this.port;
  }

  return "";
}

/**
 * @return {Number}
 */
KURL.prototype.portNumber = function() {
  if (this.port) {
    return parseInt(this.port);
  }

  if (this.proto == "https") {
    return 443;
  }

  return 80;
}

/**
 * @return {KURL}
 */
KURL.prototype.copy = function() {
  return Object.assign(Object.create(this), this);
}

/**
 * @return {KURL}
 */
KURL.prototype.setQ = function(k, v) {
  var $this = this.copy();
  $this.query[k] = v;
  return $this;
}

/**
 * @return {KURL}
 */
KURL.prototype.clearQ = function(k, v) {
  var $this = this.copy();
  $this.query = {};
  return $this;
}

/**
 * @return {KURL}
 */
KURL.prototype.subPath = function(str) {
  var $this   = this.copy();
  $this.query = {};
  $this.path = $this.path + str;
  return $this;
}

/**
 * @return {KURL}
 */
KURL.prototype.path = function(str) {
  var $this   = this.copy();
  $this.query = {};
  $this.path = str;
  return $this;
}

module.exports = KURL;