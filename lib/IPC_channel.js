const nacl = require("tweetnacl");
const enc  = require("./Encoding");
const workerSrc = require("./IPC_worker_built");

var OPEN       = 1;
var MESSAGE    = 2;
var BROADCAST  = 3;
var PING       = 4;
var DISCONNECT = 5;

function randomString() {
  var bytes = nacl.randomBytes(32);
  return enc.encodeToUTF8(bytes).toUpperCase();
}

/**
 * Facilitates inter-process communication, where processes are browser tabs.
 * 
 * @class
 */
function IPC_channel() {
  var $this = this;
  $this.handlers = {};
  $this.sw = new SharedWorker(workerSrc);

  $this.sw.port.addEventListener("error", function (err) {
    console.log(err);
  });

  $this.sw.port.addEventListener("message", function (msg) {
    switch (msg.data.type) {
      case MESSAGE:
        $this.callFunc("message", msg.data.msg);
        break;

      case DISCONNECT:
        $this.callFunc("disconnect", msg.data);
        break;
    }
  });

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
    id: $this.id
  });

  $this.sw.port.start();

  function IPC_ping() {
    $this.sw.port.postMessage({
      type: PING,
      id: $this.id
    });

    setTimeout(IPC_ping, 2000);
  }

  IPC_ping();
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