'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
    // usernameField: 'username',
    usernameField: 'email',
    passwordField: 'password'
  },
  function (email, password, done) {
    User.findOne({
      email: email
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user || !user.authenticate(password)) {
        return done(null, false, {
          message: 'MS_USERS_LOGIN_FAILED'
        });
      }
      if (user.status === 1) {
        return done(null, false, {
          message: 'MS_USERS_SIGNUP_NOTACTIVE'
        });
      }
      if (user.status === 3) {
        return done(null, false, {
          message: 'MS_USERS_BLOCK'
        });
      }
      return done(null, user);
    });
  }));
};
