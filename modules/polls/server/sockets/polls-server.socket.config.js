'use strict';

var path = require('path');

// Create the chat configuration
module.exports = function (io, socket) {
  let socketNotifPath = './modules/notifs/server/controllers/socket-notif.server.controller';
  var socketNotif = require(path.resolve(socketNotifPath))(io, socket);
  // On subscribe
  socket.on('subscribe_poll', req => {
    socket.join(req.pollId);
  });
  socket.on('subscribe_public', req => {
    socket.join('public');
  });
  // On unsubscribe
  socket.on('unsubscribe_poll', req => {
    socket.leave(req.pollId);
  });
  // On unsubscribe
  socket.on('unsubscribe_public', req => {
    socket.leave('public');
  });
  // On like poll
  socket.on('poll_like', req => {
    // io.sockets.in(req.pollId).emit('poll_like', req.likeCnt);
    socketNotif.pollLikeNotif(req);
  });
  // On vote poll
  socket.on('poll_vote', req => {
    io.sockets.in(req.pollId).emit('poll_vote', { client: socket.id });
  });
  // On delete poll
  socket.on('poll_delete', req => {
    io.sockets.in(req.pollId).emit('poll_delete', { client: socket.id });
  });
  // On delete poll
  socket.on('poll_update', req => {
    io.sockets.in(req.pollId).emit('poll_update', { client: socket.id });
  });
  // On delete poll
  socket.on('poll_create', req => {
    io.sockets.in('public').emit('poll_create');
  });
  // On comment added
  socket.on('cmt_add', req => {
    io.sockets.in(req.pollId).emit('cmt_add', { cmtId: req.cmtId, isNew: req.isNew, client: socket.id });
    socketNotif.pollCmtNotif(req);
  });
  // On comment deleted
  socket.on('cmt_del', req => {
    io.sockets.in(req.pollId).emit('cmt_del', { cmtId: req.cmtId, client: socket.id });
  });
  // On delete poll
  socket.on('opts_update', req => {
    io.sockets.in(req.pollId).emit('opts_update', { client: socket.id });
    socketNotif.optRequestNotif(req);
  });
  // On delete poll
  socket.on('opts_request', req => {
    io.sockets.in(req.pollId).emit('opts_request', req.optId);
  });

  // io.sockets.connected[socket.id].emit('comment_result', { success: true });
}