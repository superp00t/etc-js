function Vsn(s) {
  this.s = s;
}

Vsn.prototype.tokenize = function() {
  return this.s.split(".").map(e => parseInt(e));
}

Vsn.prototype.toString = function() { return this.s; }

Vsn.prototype.cmp = function(v) {
  var t  = this.tokenize();
  var t2 = v.tokenize();

  for (var x = 0; x < t.length; x++) {
    if (t[x] == t2[x]) {
      continue;
    }

    if (t2[x] < t[x]) {
      return -1;
    }

    if (t2[x] > t[x]) {
      return 1;
    }
  }

  return 0
}

module.exports = Vsn;