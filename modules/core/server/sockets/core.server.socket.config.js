'use strict';

const _ = require('lodash');
// Create the chat configuration
module.exports = function(io, socket) {
  socket.on('init', function(req) {
    console.log('Has user join system');
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function() {
    console.log('Has user out system');
  });
};
