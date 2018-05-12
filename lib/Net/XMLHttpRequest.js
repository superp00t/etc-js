if (typeof module !== 'undefined' && module.exports) {
  module.exports = require("./XMLHttpRequest_node");
} else {
  module.exports = window.XMLHttpRequest;
}