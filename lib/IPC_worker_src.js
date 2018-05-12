var OPEN       = 1;
var MESSAGE    = 2;
var BROADCAST  = 3;
var PING       = 4;
var DISCONNECT = 5;

var timeoutSeconds = 20;
var subscribers    = {};

/**
 * 
 * Destroy a tab subscriber, and tell all other tabs that this tab has left.
 * 
 * @param {String} id 
 */
function cleanupSubscriber(id) {
  delete subscribers[id];
  broadcastEvent({
    type:    DISCONNECT,
    id:      id,
    current: Object.keys(subscribers)
  });
}

/**
 * Unsubscribe tabs that have not pinged recently.
 */
function cleanupDeadSubscribers() {
  var ok = Object.keys(subscribers);
  for(var i = 0; i < ok.length; i++) {
    var k = ok[i];
    if (subscribers[k].lastPing < (Date.now() - (timeoutSeconds * 1000))) {
      cleanupSubscriber(k);
    }
  }
}

/**
 * 
 * @param {String} sub 
 * @param {Object} ev 
 */
function sendEvent(sub, ev) {
  subscribers[sub].port.postMessage(ev);
}

/**
 * 
 * @param {Object} ev 
 */
function broadcastEvent(ev) {
  var ok = Object.keys(subscribers);
  for(var i = 0; i < ok.length; i++) {
    var k = ok[i];
    sendEvent(k, ev);
  }

  cleanupDeadSubscribers();
}

self.addEventListener("connect", function(e) {
  var p = e.ports[0];
  var id = "";

  p.addEventListener("message", function(msg) {
    switch (msg.data.type) {
      case OPEN:
      subscribers[msg.data.id] = {
        port:     p,
        lastPing: Date.now()
      };
      id = msg.data.id;
      break;

      case BROADCAST:
      subscribers[msg.data.id].lastPing = Date.now();
      broadcastEvent({
        type: MESSAGE,
        msg:  msg.data.msg
      });
      break;

      case PING:
      subscribers[msg.data.id].lastPing = Date.now();
      break;

      case DISCONNECT:
      cleanupSubscriber(msg.data.id);
      break;
    }
  });

  p.start();
});
