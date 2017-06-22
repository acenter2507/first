'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Cmt = mongoose.model('Cmt'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Polltag = mongoose.model('Polltag'),
  Like = mongoose.model('Like'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// Create the chat configuration
module.exports = function(io, socket) {
  // On subscribe
  socket.on('subscribe', req => {
    socket.join(req.pollId);
  });
  // On unsubscribe
  socket.on('unsubscribe', req => {
    socket.leave(req.pollId);
  });
  // On comment added
  socket.on('cmt_add', req => {
    io.sockets.in(req.pollId).emit('cmt_add', req.cmtId);
  });
  // On comment deleted
  socket.on('cmt_del', req => {
    io.sockets.in(req.pollId).emit('cmt_del', req.cmtId);
  });
  // On like poll
  socket.on('cmt_like', req => {
    io.sockets.in(req.pollId).emit('cmt_like', { cmtId: req.cmtId, likeCnt: req.likeCnt });
  });
  // On like poll
  socket.on('poll_like', req => {
    io.sockets.in(req.pollId).emit('poll_like', req.likeCnt);
  });
  // On vote poll
  socket.on('poll_vote', req => {
    io.sockets.in(req.pollId).emit('poll_vote');
  });
  // On delete poll
  socket.on('poll_delete', req => {
    io.sockets.in(req.pollId).emit('poll_delete');
  });
  // On delete poll
  socket.on('poll_update', req => {
    io.sockets.in(req.pollId).emit('poll_update');
  });
  // On delete poll
  socket.on('poll_create', req => {
    io.sockets.in('polls').emit('poll_create');
  });
  // io.sockets.connected[socket.id].emit('comment_result', { success: true });
};
