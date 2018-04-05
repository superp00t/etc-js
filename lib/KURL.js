/**
 * Decode an encoded query string
 * 
 * @param  {String} input
 * 
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
  this.path     = this.resource.split(this.host)[1];

  var q = this.path.split("?");
  this.path = q[0];
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
           , this.host
           , this.path
           , encodeQuery(this.query)
         ].join("");
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
KURL.prototype.subPath = function(str) {
  var _this   = this.copy();
  _this.query = {};
  _this.path = _this.path + str;
  return _this;
}

module.exports = KURL;