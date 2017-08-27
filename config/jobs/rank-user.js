'use strict';

var mongoose = require('mongoose');
// path = require('path'),
// User = mongoose.model('User'),
// Poll = mongoose.model('Poll'),
// Opt = mongoose.model('Opt'),
// Cmt = mongoose.model('Cmt'),
// Vote = mongoose.model('Vote'),
// Voteopt = mongoose.model('Voteopt'),
// Polltag = mongoose.model('Polltag'),
// Polluser = mongoose.model('Polluser'),
// Report = mongoose.model('Report'),
// Bookmark = mongoose.model('Bookmark'),
// Category = mongoose.model('Category'),
// View = mongoose.model('View'),
// Like = mongoose.model('Like'),
//Userreport = mongoose.model('Userreport');

exports.excute = function () {
  get_users()
    .then(users => {
      if (users.length === 0) return;
      var length = users.length;
      var counter = 0;
      users.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        get_report(array[index]._id)
          .then(rs => {
            array[index].report = rs;
            return 
          })
          .catch(err => {
            console.log(err);
          })
      });
    })
    .catch(err => {
      console.log(err);
    });
};

function get_users() {
  return new Promise((resolve, reject) => {
    var User = mongoose.model('User');
    User.find({ 'roles': { '$not': { '$all': ['user', 'admin'] } } })
      .select('displayName')
      .then(users => {
        return resolve(users);
      }, err => {
        return reject(err);
      });
  });
}
function get_report(userId) {
  return new Promise((resolve, reject) => {
    var Userreport = mongoose.model('Userreport');
    Userreport.findOne({ user: userId })
      .then(report => {
        return resolve(report);
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
      })
  });
}
function count_cmt(userId) {
  return new Promise((resolve, reject) => {
    var Cmt = mongoose.model('Cmt');
    Cmt.find({ user: userId })
      .count(function (err, count) {
        if (err) return reject(err);
        return resolve(count);
      })
  });
}
function count_cmt_like(userId) {
  return new Promise((resolve, reject) => {
    var Cmt = mongoose.model('Cmt');
    Cmt.aggregate([
      {
        $match: {
          userId: userId
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