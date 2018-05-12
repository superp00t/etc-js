if (typeof window == 'undefined') {
  module.exports = require("./XMLHttpRequest_node");
} else {
  module.exports = window.XMLHttpRequest;
}