const RandomInt = require("./RandomInt");

module.exports = function(array) {
  return array[RandomInt(0, array.length)];
}