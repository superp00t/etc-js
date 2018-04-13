#!/bin/bash
data=$(cat lib/IPC_worker_src.js | base64 -w0)
dataURI=$(echo "data:text/javascript;base64,$data")
dataJS=$(echo 'module.exports = "'$dataURI'";')
echo $dataJS > lib/IPC_worker_built.js
