'use strict';

const _ = require('underscore');
// Create the chat configuration
module.exports = function (io, socket) {
  socket.on('init', function (req) {
    console.log('Has user join system');
    if (!_.contains(global.socketUsers, { socket: socket.id })) {
      global.socketUsers.push({ socket: socket.id, user: req.user });
    }
    console.log('Online users: ', global.socketUsers.length);
    console.log(global.name);
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    global.socketUsers = _.without(global.socketUsers, { socket: socket.id });
    console.log('Has user out system');
    console.log('Online users: ', global.socketUsers.length);
    console.log(global.name);
  });
};
