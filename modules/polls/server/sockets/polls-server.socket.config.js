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
    console.log('Has user subscribe poll');
    socket.join(req.pollId);
  });
  socket.on('subscribe_public', req => {
    console.log('Has user subscribe public');
    socket.join('public');
  });
  // On unsubscribe
  socket.on('unsubscribe_poll', req => {
    console.log('Has user unstb poll');
    socket.leave(req.pollId);
  });
  // On unsubscribe
  socket.on('unsubscribe_public', req => {
    console.log('Has user unstb public room');
    socket.leave('public');
  });

  // On like poll
  socket.on('poll_like', req => {
    console.log('Has poll like event: ', req);
    io.sockets.in(req.pollId).emit('poll_like', req.report);
    if (req.type === 0) {
      return;
    }
    var action = (req.type === 1) ? 'liked' : 'disliked';
    var notif = new Notif({
      from: req.from,
      to: req.to,
      content: 'has ' + action + ' your poll ',
      poll: req.pollId
    });
    notif.save().then(notif => {
      var socketIds = _.where(global.socketUsers, { user: req.to });
      socketIds.forEach(item => {
        io.sockets.connected[item.socket].emit('notifs', notif._id);
      });
    });
  });
  // On vote poll
  socket.on('poll_vote', req => {
    console.log('Has poll vote event');
    io.sockets.in(req.pollId).emit('poll_vote');
  });
  // On delete poll
  socket.on('poll_delete', req => {
    console.log('Has poll delete event');
    io.sockets.in(req.pollId).emit('poll_delete');
  });
  // On delete poll
  socket.on('poll_update', req => {
    console.log('Has poll update event');
    io.sockets.in(req.pollId).emit('poll_update');
  });
  // On delete poll
  socket.on('poll_create', req => {
    console.log('Has poll poll_create event');
    io.sockets.in('public').emit('poll_create');
  });

  // On comment added
  socket.on('cmt_add', req => {
    io.sockets.in(req.pollId).emit('cmt_add', req.cmtId);
    if (req.to) {
      var notif = new Notif({
        from: req.from,
        to: req.to,
        content: 'has replied your comment on',
        poll: req.pollId
      });
      notif.save().then(notif => {
        var socketIds = _.where(global.socketUsers, { user: req.to });
        socketIds.forEach(item => {
          io.sockets.connected[item.socket].emit('notifs', notif._id);
        });
      });
    } else {
      // Tìm toàn bộ các member đang theo dõi poll
      Polluser.find({ poll: req.pollId, following: true }).then(
        pollusers => {
          var notif;
          // Tạo notif cho toàn bộ các member đang theo dõi
          pollusers.forEach((polluser, index) => {
            if (polluser.user.toString() !== req.from.toString()) {
              notif = new Notif({
                from: req.from,
                to: polluser.user,
                content: 'has posted a comment on',
                poll: req.pollId
              });
              notif.save().then(
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
                },
                err => {
                  console.log('Has error when save notif comment');
                }
              );
            }
          });
        },
        err => {
          console.log('Has error when get user in poll for comment');
        }
      );
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
    if (req.type === 0) {
      return;
    }
    var action = (req.type === 1) ? 'liked' : 'disliked';
    var notif = new Notif({
      from: req.from,
      to: req.to,
      content: 'has ' + action + ' your comment on',
      poll: req.pollId
    });
    notif.save().then(notif => {
      var socketIds = _.where(global.socketUsers, { user: req.to });
      socketIds.forEach(item => {
        io.sockets.connected[item.socket].emit('notifs', notif._id);
      });
    });
  });

  // On delete poll
  socket.on('opts_update', req => {
    io.sockets.in(req.pollId).emit('opts_update');
  });
  // On delete poll
  socket.on('opts_request', req => {
    io.sockets.in(req.pollId).emit('opts_request');
  });

  // io.sockets.connected[socket.id].emit('comment_result', { success: true });
};
