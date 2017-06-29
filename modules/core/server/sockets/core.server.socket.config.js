'use strict';

const _ = require('underscore');
// Create the chat configuration
module.exports = function (io, socket) {
  socket.on('init', function (req) {
    if (!_.contains(global.socketUsers, { socket: socket.id })) {
      global.socketUsers.push({ socket: socket.id, user: req.user });
      console.log('Has user online: ', global.socketUsers.length);
    }
  });

  socket.on('guest', function (req) {
    if (!_.contains(global.socketGuests, socket.id)) {
      global.socketGuests.push(socket.id);
      console.log('Has guest online: ', global.socketGuests.length);
    }
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    if (_.contains(global.socketGuests, socket.id)) {
      global.socketGuests = _.without(global.socketGuests, _.findWhere(global.socketGuests, socket.id));
      console.log('Has guest offline: ', global.socketGuests.length);
    } else {
      global.socketUsers = _.without(global.socketUsers, _.findWhere(global.socketUsers, { socket: socket.id }));
      console.log('Has user offline: ', global.socketUsers.length);
    }
  });
};
