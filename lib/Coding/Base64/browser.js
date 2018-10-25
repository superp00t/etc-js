module.exports = {
  encode: function(arr) { 
    var i, s = [], len = arr.length;
    for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
    return btoa(s.join(''));
  },

  decode: function(s) {
    try {
      var i, d = atob(s), b = new Uint8Array(d.length);
      for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
      return b;
    } catch (e) {
      console.warn(e);
      return new Uint8Array(0);
    }
  }
}