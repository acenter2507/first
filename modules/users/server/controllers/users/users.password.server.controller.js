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
      var url = config.http + '://' + req.headers.host + '/api/auth/reset/' + _user.activeAccountToken;
      var mailTemplate = 'resetpass';
      var mailContent = {
        name: _user.displayName,
        appName: config.app.title,
        url: url
      };
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
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
  // async.waterfall([
  //   // Generate random token
  //   function (done) {
  //     crypto.randomBytes(20, function (err, buffer) {
  //       var token = buffer.toString('hex');
  //       done(err, token);
  //     });
  //   },
  //   // Lookup user by username
  //   function (token, done) {
  //     if (req.body.email) {
  //       User.findOne({
  //         email: req.body.email
  //       }, '-salt -password', function (err, user) {
  //         if (!user) {
  //           return res.status(400).send({
  //             message: 'MS_USERS_NOT_EXIST'
  //           });
  //         } else if (user.provider !== 'local') {
  //           return res.status(400).send({
  //             message: 'MS_USERS_VERIFI_ERROR_3'
  //           });
  //         } else if (user.status === 1) {
  //           return res.status(400).send({
  //             message: 'MS_USERS_SIGNUP_NOTACTIVE'
  //           });
  //         } else if (user.status === 3) {
  //           return res.status(400).send({
  //             message: 'MS_USERS_BLOCK'
  //           });
  //         } else {
  //           user.resetPasswordToken = token;
  //           user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  //           user.save(function (err) {
  //             done(err, token, user);
  //           });
  //         }
  //       });
  //     } else {
  //       return res.status(400).send({
  //         message: 'LB_USER_EMAIL_INVALID'
  //       });
  //     }
  //   },
  //   function (token, user, done) {
  //     var url = httpTransport + req.headers.host + '/api/auth/reset/' + token;
  //     var mailTemplate = new EmailTemplate(path.join('modules/users/server/templates', 'resetpass'));
  //     var mailContent = {
  //       name: user.displayName,
  //       appName: config.app.title,
  //       url: url
  //     };
  //     mailTemplate.render(mailContent, function (err, result) {
  //       if (err)
  //         return res.status(400).send({ message: 'MS_USERS_SEND_FAIL' });
  //       var mailOptions = {
  //         from: config.app.title + '<' + config.mailer.account.from + '>',
  //         to: user.email,
  //         subject: 'Reset your password',
  //         html: result.html
  //       };
  //       transporter.sendMail(mailOptions, function (err) {
  //         if (!err) {
  //           return res.json({ message: 'MS_USERS_SEND_SUCCESS' });
  //         } else {
  //           return res.status(400).send({
  //             message: 'MS_USERS_SEND_FAIL'
  //           });
  //         }
  //         done();
  //       });
  //     });
  //   }
  // ], function (err) {
  //   if (err) {
  //     return next(err);
  //   }
  // });
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
          res.json(_user);

          var mailTemplate = 'inform_reset_password';
          var mailContent = {
            name: _user.displayName,
            appName: config.app.title
          };
          var mailOptions = {
            from: config.app.title + '<' + config.mailer.account.from + '>',
            to: _user.email,
            subject: 'Your password has been changed'
          };
          return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
        });
      })
      .catch(handleError);
  });


  function handleError(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }

  // async.waterfall([

  //   function (done) {
  //     User.findOne({
  //       resetPasswordToken: req.params.token,
  //       resetPasswordExpires: {
  //         $gt: Date.now()
  //       }
  //     }, function (err, user) {
  //       if (!err && user) {
  //         if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
  //           user.password = passwordDetails.newPassword;
  //           user.resetPasswordToken = undefined;
  //           user.resetPasswordExpires = undefined;

  //           user.save(function (err) {
  //             if (err) {
  //               return res.status(400).send({
  //                 message: errorHandler.getErrorMessage(err)
  //               });
  //             } else {
  //               req.login(user, function (err) {
  //                 if (err) {
  //                   res.status(400).send(err);
  //                 } else {
  //                   // Remove sensitive data before return authenticated user
  //                   user.password = undefined;
  //                   user.salt = undefined;
  //                   res.json(user);
  //                   done(err, user);
  //                 }
  //               });
  //             }
  //           });
  //         } else {
  //           return res.status(400).send({
  //             message: 'LB_USER_VERIFY_PASSWORD_MATCH'
  //           });
  //         }
  //       } else {
  //         return res.status(400).send({
  //           message: 'MS_USERS_RESETPASS_INVALID'
  //         });
  //       }
  //     });
  //   },
  //   function (user, done) {
  //     var mailTemplate = new EmailTemplate(path.join('modules/users/server/templates', 'inform_reset_password'));
  //     var mailContent = {
  //       name: user.displayName,
  //       appName: config.app.title
  //     };
  //     mailTemplate.render(mailContent, function (err, result) {
  //       if (err)
  //         return res.status(400).send({ message: 'MS_USERS_SEND_FAIL' });
  //       var mailOptions = {
  //         from: config.app.title + '<' + config.mailer.account.from + '>',
  //         to: user.email,
  //         subject: 'Your password has been changed',
  //         html: result.html
  //       };
  //       transporter.sendMail(mailOptions, function (err) {
  //         done();
  //       });
  //     });
  //   }
  // ], function (err) {
  //   if (err) {
  //     return next(err);
  //   }
  // });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

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
                        message: 'Password changed successfully'
                      });
                    }
                  });
                }
              });
            } else {
              res.status(400).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            res.status(400).send({
              message: 'Current password is incorrect'
            });
          }
        } else {
          res.status(400).send({
            message: 'User is not found'
          });
        }
      });
    } else {
      res.status(400).send({
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(400).send({
      message: 'User is not signed in'
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