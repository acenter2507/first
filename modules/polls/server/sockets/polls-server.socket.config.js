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
  // On Comment
  socket.on('comment', (cmt) => {
    if (cmt._id) {
      Cmt.findById(cmt._id)
        .then(_cmt => {
          _cmt = _.extend(_cmt, cmt);
          return _cmt.save();
        })
        .then(_cmt => {
          cmt = _cmt;
          io.emit('comment', _cmt);
          io.sockets.connected[socket.id].emit('comment_result', { success: true });
        })
        .catch(err => {
          io.sockets.connected[socket.id].emit('comment_result', { success: fail, err: err });
        });
    } else {
      var new_cmt = new Cmt(cmt);
      new_cmt.save()
        .then(_cmt => {
          new_cmt = _cmt;
          return Poll.countUpCmt(_cmt.poll);
        })
        .then(_poll => {
          io.emit('comment', new_cmt);
          io.sockets.connected[socket.id].emit('comment_result', { success: true });
        })
        .catch(err => {
          io.sockets.connected[socket.id].emit('comment_result', { success: fail, err: err });
        });
    }
  });
};
