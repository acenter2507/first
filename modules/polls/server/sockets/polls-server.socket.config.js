'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Cmt = mongoose.model('Cmt'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Polltag = mongoose.model('Polltag'),
  Polluser = mongoose.model('Polluser'),
  Notif = mongoose.model('Notif'),
  Like = mongoose.model('Like'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  _ = require('underscore');

// Create the chat configuration
module.exports = function (io, socket) {
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
    io.sockets.in(req.pollId).emit('poll_like', req.report);
    if (req.type === 0) {
      Notif.findOne({ poll: req.pollId, type: { $in: [0, 1] }, from: req.from, count: 0 })
        .then(_nof => {
          _nof.remove();
        });
      return;
    }
    // Create notifis
    var action = (req.type === 1) ? 'liked' : 'disliked';
    var type = req.type - 1;
    Notif.findOne({ poll: req.pollId, type: { $in: [0, 1] }, from: req.from })
      .then(_nof => {
        if (_nof) {
          if (_nof.type !== type && _nof.count === 0) {
            _nof.type = type;
            _nof.content = action + ' your poll:';
            _nof.status = 0;
            _nof.save().then(notif => {
              var socketIds = _.where(global.socketUsers, { user: req.to });
              socketIds.forEach(item => {
                io.sockets.connected[item.socket].emit('notifs', notif._id);
              });
            });
          }
        } else {
          Notif.findOne({ poll: req.pollId, type: type, status: 0 })
            .then(_nof => {
              if (_nof) {
                _nof.from = req.from;
                _nof.count += 1;
                _nof.content = 'and ' + _nof.count + ' other people recently ' + action + ' your poll:';
                _nof.save().then(notif => {
                  var socketIds = _.where(global.socketUsers, { user: req.to });
                  socketIds.forEach(item => {
                    io.sockets.connected[item.socket].emit('notifs', notif._id);
                  });
                }, handlerError);
              } else {
                _nof = new Notif({
                  from: req.from,
                  to: req.to,
                  content: action + ' your poll:',
                  poll: req.pollId,
                  state: 'polls.view'
                });
                _nof.save().then(notif => {
                  var socketIds = _.where(global.socketUsers, { user: req.to });
                  socketIds.forEach(item => {
                    io.sockets.connected[item.socket].emit('notifs', notif._id);
                  });
                }, handlerError);
              }
            }, handlerError);
        }
      });
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
    io.sockets.in('public').emit('poll_create');
  });

  // On comment added
  socket.on('cmt_add', req => {
    io.sockets.in(req.pollId).emit('cmt_add', req.cmtId);
    if (req.to) {
      Notif.findOne({ poll: req.pollId, type: 2, from: req.from, status: 0 })
        .then(_nof => {
          if (!_nof) {
            _nof = new Notif({
              from: req.from,
              to: req.to,
              type: 2,
              content: 'replied your comment on:',
              poll: req.pollId,
              state: 'polls.view'
            });
            _nof.save().then(_nof => {
              var socketIds = _.where(global.socketUsers, { user: req.to });
              socketIds.forEach(item => {
                io.sockets.connected[item.socket].emit('notifs', _nof._id);
              });
            });
          }
        });
    } else {
      // Tìm toàn bộ các member đang theo dõi poll
      Polluser.find({ poll: req.pollId, following: true }).then(
        pollusers => {
          var notif;
          // Tạo notif cho toàn bộ các member đang theo dõi
          pollusers.forEach((polluser, index) => {
            if (polluser.user.toString() !== req.from.toString()) {
              Notif.findOne({ to: polluser.user, type: 3, status: 0, poll: req.pollId })
                .then(_nof => {
                  if (_nof) {
                    if (_nof.from.toString() !== req.from) {
                      _nof.from = req.from;
                      _nof.count += 1;
                      _nof.content = 'and ' + _nof.count + ' other people recently commented on:';
                      _nof.save().then(
                        _notif => {
                          var socketIds = _.where(global.socketUsers, {
                            user: polluser.user.toString()
                          });
                          socketIds.forEach(item => {
                            io.sockets.connected[item.socket].emit('notifs', _notif._id);
                          });
                        });
                    }
                  } else {
                    _nof = new Notif({
                      from: req.from,
                      to: polluser.user,
                      content: 'commented on',
                      type: 3,
                      poll: req.pollId,
                      state: 'polls.view'
                    });
                    _nof.save().then(
                      _notif => {
                        var socketIds = _.where(global.socketUsers, {
                          user: polluser.user.toString()
                        });
                        socketIds.forEach(item => {
                          io.sockets.connected[item.socket].emit(
                            'notifs',
                            _notif._id
                          );
                        });
                      });
                  }
                });
            }
          });
        });
    }
  });
  // On comment deleted
  socket.on('cmt_del', req => {
    io.sockets.in(req.pollId).emit('cmt_del', req.cmtId);
  });
  // On like poll
  socket.on('cmt_like', req => {
    io.sockets
      .in(req.pollId)
      .emit('cmt_like', { cmtId: req.cmtId, likeCnt: req.likeCnt });
  });

  // On delete poll
  socket.on('opts_update', req => {
    io.sockets.in(req.pollId).emit('opts_update');
  });
  // On delete poll
  socket.on('opts_request', req => {
    io.sockets.in(req.pollId).emit('opts_request');
    Notif.findOne({ poll: req.pollId, to: req.to, type: 4, status: 0 })
      .then(_nof => {
        if (_nof) {
          if (_nof.from.toString() !== req.from) {
            _nof.from = req.from;
            _nof.count += 1;
            _nof.content = 'and ' + _nof.count + ' other people recently suggested on:';
            _nof.save().then(
              _notif => {
                var socketIds = _.where(global.socketUsers, {
                  user: req.to
                });
                socketIds.forEach(item => {
                  io.sockets.connected[item.socket].emit('notifs', _notif._id);
                });
              });
          }
        } else {
          _nof = new Notif({
            from: req.from,
            to: req.to,
            content: 'suggested on',
            type: 4,
            poll: req.pollId,
            state: 'polls.edit'
          });
          _nof.save().then(
            _notif => {
              var socketIds = _.where(global.socketUsers, {
                user: req.to
              });
              socketIds.forEach(item => {
                io.sockets.connected[item.socket].emit(
                  'notifs',
                  _notif._id
                );
              });
            });
        }
      });
  });

  // io.sockets.connected[socket.id].emit('comment_result', { success: true });
  function next() {
    return new Promise((resolve, reject) => {
      return resolve();
    });
  }

  function handlerError(err) {
    console.log(err);
  }
};
