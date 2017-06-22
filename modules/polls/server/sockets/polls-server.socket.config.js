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
  // On comment deleted
  socket.on('poll_like', req => {
    io.sockets.in(req.pollId).emit('poll_like', { userId: req.userId, likeId: req.likeId });
  });

  socket.on('sample', (cmt) => {
    if (cmt._id) {
      Cmt.findById(cmt._id)
        .then(_cmt => {
          _cmt = _.extend(_cmt, cmt);
          return _cmt.save();
        }, handle_error)
        .then(_cmt => {
          cmt = _cmt;
          io.emit('comment', _cmt);
          io.sockets.connected[socket.id].emit('comment_result', { success: true });
        }, handle_error);
    } else {
      var new_cmt = new Cmt(cmt);
      new_cmt.save()
        .then(_cmt => {
          new_cmt = _cmt;
          return Poll.countUpCmt(_cmt.poll);
        }, handle_error)
        .then(_poll => {
          io.emit('comment');
          io.sockets.connected[socket.id].emit('comment_result', { success: true });
        }, handle_error);
    }

    function handle_error(err) {
      io.sockets.connected[socket.id].emit('comment_result', { success: false, err: err });
    }
  });
};
