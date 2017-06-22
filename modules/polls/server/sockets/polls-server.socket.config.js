'use strict';

// Create the chat configuration
module.exports = function(io, socket) {
  // Send a chat messages to all connected sockets when a message is received
  socket.on('comment', (req) => {
    console.log(req);
    // Emit the 'chatMessage' event
    //    io.emit('chatMessage', message);
  });
};
