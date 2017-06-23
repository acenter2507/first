'use strict';

const _ = require('underscore');
// Create the chat configuration
module.exports = function (io, socket) {
  socket.on('init', function (req) {
    if (!_.contains(global.socketUsers, { socket: socket.id })) {
      global.socketUsers.push({ socket: socket.id, user: req.user });
    }
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    global.socketUsers = _.without(global.socketUsers, { socket: socket.id });
  });
};
