'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  mail = require(path.resolve('./config/lib/mail')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  crypto = require('crypto'),
  validator = require('validator');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
  var email = req.body.email || '';
  var user;
  validEmail(email)
    .then(_user => {
      user = _user;
      return getToken();
    })
    .then(token => {
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      return saveUser(user);
    })
    .then(_user => {
      var url = config.http + '://' + req.headers.host + '/api/auth/reset/' + _user.resetPasswordToken;
      var mailTemplate = 'resetpass_' + _user.language;
      var mailContent = {
        name: _user.displayName,
        appName: config.app.title,
        url: url
      };
      var subject = global.translate[_user.language].EMAIL_SJ_FORGET || global.translate[config.defaultLanguage].EMAIL_SJ_FORGET;
      var mailOptions = {
        from: config.app.title + '<' + config.mailer.account.from + '>',
        to: _user.email,
        subject: 'Reset your password'
      };
      return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
    })
    .then(() => {
      return res.json({ message: 'MS_USERS_SEND_SUCCESS' });
    })
    .catch(handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user || err) {
      return res.redirect('/password/reset/invalid');
    }

    res.redirect('/password/reset/' + req.params.token);
  });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;
  if (passwordDetails.newPassword !== passwordDetails.verifyPassword)
    return handleError(new Error('LB_USER_VERIFY_PASSWORD_MATCH'));

  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, (err, user) => {
    if (err || !user)
      return handleError(new Error('MS_USERS_RESETPASS_INVALID'));
    user.password = passwordDetails.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    saveUser(user)
      .then(_user => {
        req.login(_user, function (err) {
          if (err) return res.status(400).send(err);
          _user.password = undefined;
          _user.salt = undefined;
          return res.json(_user);

          // var mailTemplate = 'inform_reset_password';
          // var mailContent = {
          //   name: _user.displayName,
          //   appName: config.app.title
          // };
          // var mailOptions = {
          //   from: config.app.title + '<' + config.mailer.account.from + '>',
          //   to: _user.email,
          //   subject: 'Your password has been changed'
          // };
          // return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
        });
      })
      .catch(handleError);
  });


  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }

};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findById(req.user.id, function (err, user) {
        if (!err && user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              user.save(function (err) {
                if (err) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      res.send({
                        message: 'LB_USER_PASSWORD_CHANGE_SUCCESS'
                      });
                    }
                  });
                }
              });
            } else {
              res.status(400).send({
                message: 'LB_USER_VERIFY_PASSWORD_MATCH'
              });
            }
          } else {
            res.status(400).send({
              message: 'LB_USER_PASSWORD_CHANGE_INCORRECT'
            });
          }
        } else {
          res.status(400).send({
            message: 'LB_USER_NOT_FOUND'
          });
        }
      });
    } else {
      res.status(400).send({
        message: 'LB_USER_NEW_PASSWORD_REQUIRED'
      });
    }
  } else {
    res.status(400).send({
      message: 'MS_CM_AUTH_ERROR'
    });
  }
};


function validEmail(email) {
  return new Promise((resolve, reject) => {
    if (email.length === 0)
      return reject(new Error('LB_USER_EMAIL_REQUIRED'));
    if (!validator.isEmail(email))
      return reject(new Error('LB_USER_EMAIL_INVALID'));
    User.findOne({ email: email }, function (err, user) {
      if (err) return reject(new Error('MS_CM_LOAD_ERROR'));
      // Kiểm tra trạng thái user đã active
      if (!user) return reject(new Error('MS_USERS_NOT_EXIST'));
      if (user.provider !== 'local') return reject(new Error('MS_USERS_VERIFI_ERROR_3'));
      if (user.status === 1) return reject(new Error('MS_USERS_SIGNUP_NOTACTIVE'));
      if (user.status === 3) return reject(new Error('MS_USERS_BLOCK'));
      return resolve(user);
    });
  });
}
function getToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, function (err, buffer) {
      if (err) {
        console.log('MS_CM_LOAD_ERROR');
        return reject(new Error('MS_CM_LOAD_ERROR'));
      }
      var token = buffer.toString('hex');
      return resolve(token);
    });
  });
}
function saveUser(user) {
  return new Promise((resolve, reject) => {
    if (!user) return reject(new Error('MS_CM_LOAD_ERROR'));
    user.save(function (err, _user) {
      if (err) return reject(new Error('MS_CM_LOAD_ERROR'));
      _user.password = undefined;
      _user.salt = undefined;
      return resolve(_user);
    });
  });
}