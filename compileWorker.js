const fs = require("fs");
const path = require('path');

var fi = fs.readFileSync(path.join("lib", "IPC_worker_src.js")).toString();
var built = [
  "module.exports = ",
  '"',
  "data:application/javascript,",
  encodeURIComponent(fi),
  '"'
].join("");

fs.writeFileSync(path.join("lib", "IPC_worker_built.js"), built);
