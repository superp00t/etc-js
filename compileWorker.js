const fs = require("fs");
const path = require('path');

var fi = fs.readFileSync(path.join("lib", "IPC_worker_src.js")).toString();
var built = "module.exports = ["

var lines = fi.split("\n");

lines.forEach((e) => {
  built += ",'"
  built += e;
  built += "'\n"
});

built += "].join('\\n');";

fs.writeFileSync(path.join("lib", "IPC_worker_built.js"), built);
