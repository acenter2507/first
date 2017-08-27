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
      console.log(users);
    })
    .catch(err => {
      console.log(err);
    });
};

function get_users() {
  return new Promise((resolve, reject) => {
    var User = mongoose.model('User');
    var users = User.find({ 'roles': { '$not': { '$all': ['user', 'admin'] } } })
      .then(users => {
        return resolve(users);
      }, err => {
        return reject(err);
      });
  });
}