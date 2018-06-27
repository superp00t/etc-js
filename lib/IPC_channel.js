const nacl = require("./Crypto/NaCl");
const enc  = require("./Encoding");
const workerSrc = require("./IPC_worker_built");

var OPEN       = 1;
var MESSAGE    = 2;
var BROADCAST  = 3;
var PING       = 4;
var DISCONNECT = 5;

function randomString() {
  var bytes = nacl.randomBytes(32);
  return enc.encodeToHex(bytes).toUpperCase();
}

/**
 * Facilitates inter-process communication, where processes are browser tabs.
 * 
 * @class
 */
function IPC_channel() {
  var wSrc = URL.createObjectURL(new Blob([workerSrc], {type: 'application/javascript'}));
  var $this = this;

  $this.closed = false;
  $this.handlers = {};
  console.log("Creating worker with URL", wSrc);
  $this.sw = new SharedWorker(wSrc);

  $this.sw.onerror = function (err) {
    console.log(err.message);
  }

  $this.sw.port.onmessage = function (msg) {
    switch (msg.data.type) {
      case OPEN:
        $this.callFunc("open", {});
        break;

      case MESSAGE:
        $this.callFunc("message", msg.data.msg);
        break;

      case DISCONNECT:
        $this.callFunc("disconnect", msg.data);
        break;
    }
  }

  window.addEventListener("beforeunload", function () {
    $this.sw.port.postMessage({
      type: DISCONNECT,
      id:   $this.id
    });
  });

  $this.sw.port.start();

  $this.id = randomString();

  $this.sw.port.postMessage({
    type: OPEN,
    id:   $this.id
  });

  function IPC_ping() {
    $this.sw.port.postMessage({
      type: PING,
      id: $this.id
    });

    if (!$this.closed) {
      setTimeout(IPC_ping, 2000);
    }
  }

  IPC_ping();
}

IPC_channel.prototype.close = function() {
  $this.sw.port.postMessage({
    type: DISCONNECT,
    id:   $this.id
  });

  this.closed = true;
}

IPC_channel.prototype.on = function (type, hnd) {
  this.handlers[type] = hnd;
}

IPC_channel.prototype.callFunc = function (type, dat) {
  var h = this.handlers[type];

  if (h) {
    h(dat);
  }
}

IPC_channel.prototype.broadcast = function (ev) {
  this.sw.port.postMessage({
    type: BROADCAST,
    id: this.id,
    msg: ev
  });
}

module.exports = IPC_channel;