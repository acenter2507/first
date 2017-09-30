'use strict';

var mongoose = require('mongoose'),
  _ = require('underscore');
// path = require('path'),
// User = mongoose.model('User'),
// Poll = mongoose.model('Poll'),
// Opt = mongoose.model('Opt'),
// Cmt = mongoose.model('Cmt'),
// Vote = mongoose.model('Vote'),
// Voteopt = mongoose.model('Voteopt'),
// Polltag = mongoose.model('Polltag'),
// Report = mongoose.model('Report'),
// Bookmark = mongoose.model('Bookmark'),
// Category = mongoose.model('Category'),
// View = mongoose.model('View'),
// Like = mongoose.model('Like');

exports.excute = function () {
  get_users()
    .then(users => {
      if (users.length === 0) return;
      var length = users.length;
      var counter = 0;
      users.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        count_poll_like(array[index]._id)
          .then(rs => {
            if (rs.length === 0) {
              array[index].pollLikeCnt = 0;
              array[index].pollViewCnt = 0;
            } else {
              array[index].pollLikeCnt = rs[0].pollLike;
              array[index].pollViewCnt = rs[0].pollView;
            }
            return count_cmt_like(array[index]._id);
          })
          .then(rs => {
            if (rs.length === 0) {
              array[index].cmtLikeCnt = 0;
            } else {
              array[index].cmtLikeCnt = rs[0].total;
            }
            return point_calculate(array[index]);
          })
          .then(rs => {
            array[index].point = rs;
            if (++counter === length) {
              // array = _.sortBy(array, function(o) { return o.point; });
              array = _.sortBy(array, 'point').reverse();
              return save_rank(array);
            }
          })
          .catch(err => {
            console.log(err);
          });
      });
    })
    .catch(err => {
      console.log(err);
    });
};

function get_users() {
  return new Promise((resolve, reject) => {
    var User = mongoose.model('User');
    User.find({ 'roles': { '$not': { '$all': ['user', 'admin'] } }, 'status': 2 })
      .select('displayName')
      .then(users => {
        return resolve(users);
      }, err => {
        return reject(err);
      });
  });
}
function count_poll(userId) {
  return new Promise((resolve, reject) => {
    var Poll = mongoose.model('Poll');
    Poll.find({ isPublic: true, user: userId })
      .count(function (err, count) {
        if (err) return reject(err);
        return resolve(count);
      });
  });
}
function count_cmt(userId) {
  return new Promise((resolve, reject) => {
    var Cmt = mongoose.model('Cmt');
    Cmt.find({ user: userId })
      .count(function (err, count) {
        if (err) return reject(err);
        return resolve(count);
      });
  });
}
function count_poll_like(userId) {
  return new Promise((resolve, reject) => {
    var Poll = mongoose.model('Poll');
    Poll.aggregate([
      {
        $match: {
          user: userId
        }
      },

      {
        $group: {
          _id: null,
          pollLike: { $sum: '$likeCnt' },
          pollView: { $sum: '$viewCnt' },
        }
      }
    ], function (err, result) {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}
function count_cmt_like(userId) {
  return new Promise((resolve, reject) => {
    var Cmt = mongoose.model('Cmt');
    Cmt.aggregate([
      {
        $match: {
          user: userId
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: '$likeCnt' }
        }
      }
    ], function (err, result) {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}
function point_calculate(user) {
  return new Promise((resolve, reject) => {
    var total = 0;
    total += user.report.pollCnt * 10;
    total += user.report.cmtCnt * 4;
    total += user.pollLikeCnt * 3;
    total += user.cmtLikeCnt * 2;
    total += user.pollViewCnt * 1;
    return resolve(total);
  });
}
function save_rank(users) {
  var User = mongoose.model('User');
  users.forEach((item, index) => {
    item.rank = index + 1;
    return item.save();
  });
}