'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  Polluser = mongoose.model('Polluser'),
  Notif = mongoose.model('Notif');

const _ = require('underscore');
// Create the chat configuration
module.exports = function (io, socket) {
  return {
    pollLikeNotif: pollLikeNotif,
    pollCmtNotif: pollCmtNotif,
    optRequestNotif: optRequestNotif
  };
};

function pollLikeNotif(req) {
  if (req.type === 0) {
    findNotif({ poll: req.pollId, type: { $in: [0, 1] }, from: req.from, count: 0 })
      .then(notf => {
        if (notf) notf.remove();
      })
      .catch(saveLogErr);
    return;
  }

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
              }, saveLogErr);
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
              }, saveLogErr);
            }
          }, saveLogErr);
      }
    });
}

function pollCmtNotif(req) {
  if (!req.isNew) return;
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
              io.sockets.connected[item.socket].emit('notifs');
            });
          });
        }
      });
  } else {
    // Tìm toàn bộ các member đang theo dõi poll
    Polluser.find({ poll: req.pollId }).then(
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
}

function optRequestNotif(req) {
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
}

function findNotif(con) {
  return new Promise((resolve, reject) => {
    Notif.findOne(con, function (err, notf) {
      if (err) return reject(err);
      return resolve(notf);
    });
  });
}

function saveLogErr(err) {
  console.log(err);
}