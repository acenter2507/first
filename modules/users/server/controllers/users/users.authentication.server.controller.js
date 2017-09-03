'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  Userreport = mongoose.model('Userreport'),
  Userlogin = mongoose.model('Userlogin'),
  nev = require('email-verification')(mongoose),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  EmailTemplate = require('email-templates').EmailTemplate,
  async = require('async'),
  validator = require('validator');

let transporter = nodemailer.createTransport(config.mailer.account.options);

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init Variables
  var user = new User(req.body);
  user.provider = 'local';
  async.waterfall([
    function (done) {
      if (user.email.length === 0)
        return res.status(400).send({
          message: 'LB_USER_EMAIL_REQUIRED'
        });
      if (!validator.isEmail(user.email))
        return res.status(400).send({
          message: 'LB_USER_EMAIL_INVALID'
        });
      User.findOne({ email: user.email }, function (err, user) {
        console.log(err);
        if (user) {
          // Kiểm tra trạng thái user đã active
          if (user.status === 1)
            return res.status(400).send({
              message: 'MS_USERS_SIGNUP_NOTACTIVE'
            });
          if (user.status === 2 || user.status === 3)
            return res.status(400).send({
              message: 'LB_USERS_EMAIL_DUPLICATE'
            });
        }
        done();
      });
    },
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        console.log(err);
        if (err)
          return res.status(400).send({
            message: 'MS_CM_LOAD_ERROR'
          });
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      user.activeAccountToken = token;
      user.activeAccountExpires = Date.now() + 1800000; //86400000; // 24h
      user.save(function (err, _user) {
        if (err)
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        user = _user;
        user.password = undefined;
        user.salt = undefined;
        done(err, token, user, done);
      });
    },
    function (token, user, done) {
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var url = httpTransport + req.headers.host + '/api/auth/verify/' + token;
      var mailTemplate = new EmailTemplate(path.resolve('modules/users/server/templates/verify-email.server.view'));
      var mailContent = {
        name: user.displayName,
        appName: config.app.title,
        url: url
      };
      mailTemplate.render(mailContent, function (err, result) {
        if (err)
          return res.status(400).send({ message: 'MS_USERS_SEND_FAIL' });
        console.log(result.text);
        console.log(result.html);
      });
      // var mailOptions = {
      //   from: 'Do not reply <' + config.mailer.account.from + '>',
      //   to: user.email,
      //   subject: 'Verify your account',
      //   text: 'Plaintext version of the message',
      //   html: '<p>HTML version of the message</p>'
      // };

      // var sendTemplate = smtpTransport.templateSender(
      //   new EmailTemplate(path.resolve('modules/users/server/templates/verify-email.server.view')), {
      //     from: config.mailer.account.from,
      //   });

      // // use template based sender to send a message
      // sendTemplate(
      //   { to: user.email, subject: 'Verify your account' },
      //   {
      //     username: config.mailer.account.options.auth.user,
      //     password: config.mailer.account.options.auth.pass
      //   }, function (err, info) {
      //     if (err) {
      //       console.log('Error');
      //       return res.status(400).send({
      //         message: 'MS_USERS_SEND_FAIL'
      //       });
      //     } else {
      //       console.log('Password reminder sent');
      //       return res.redirect('/authentication/send');
      //     }
      //   });
      done();
      // res.render(path.resolve('modules/users/server/templates/verify-email'), {
      //   name: user.displayName,
      //   appName: config.app.title,
      //   url: url
      // }, function (err, emailHTML) {
      //   done(err, emailHTML, user);
      // });
    }
    // function (emailHTML, user, done) {
    //   console.log(emailHTML);
    //   var mailOptions = {
    //     to: user.email,
    //     from: config.mailer.account.from,
    //     subject: 'Verify your account',
    //     html: emailHTML
    //   };
    //   smtpTransport.sendMail(mailOptions, function (err) {
    //     if (!err) {
    //       return res.redirect('/authentication/send');
    //     } else {
    //       return res.status(400).send({
    //         message: 'MS_USERS_SEND_FAIL'
    //       });
    //     }
    //     done();
    //   });
    // }
  ], function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
  });

  // verifyEmail(user.email)
  //   .then(() => {
  //     user.provider = 'local';
  //     console.log('Process 1');
  //     return gen_token();
  //   })
  //   .then(token => {
  //     console.log('Process 2');
  //     console.log(token);
  //     user.activeAccountToken = token;
  //     user.activeAccountExpires = Date.now() + 1800000; //86400000; // 24h
  //     user.save(function (err, _user) {
  //       if (err) return handleError(err);
  //       console.log(_user);
  //       user = _user;
  //       user.password = undefined;
  //       user.salt = undefined;
  //       return render_main_content(token, user, req.headers.host, res);
  //     });
  //   })
  //   .then(rs => {
  //     console.log('Process 3');
  //     return send_verification(rs.html, rs.user);
  //   })
  //   .then(msg => {
  //     console.log('Process 4');
  //     return res.redirect('/authentication/send');
  //   })
  //   .catch(err => {
  //     console.log('Error 1');
  //     console.log(err);
  //     return res.status(400).send({ message: err.message });
  //   });
  // function handleError(err) {
  //   console.log('@ldlg@pelr@plge@prlg@perg@pler@pgle@prlg@pelrg@pler@pgle@rplge@prg@pelrgp@ergl');
  //   console.log('DKM', err);
  //   return res.status(400).send({
  //     message: errorHandler.getErrorMessage(err)
  //   });
  // }
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      var login = new Userlogin({ user: user._id });
      login.agent = req.headers['user-agent'];
      login.ip = getClientIp(req);
      login.save();
      user.update({ _id: user._id }, { $set: { lastLogin: new Date() } });
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Verify
 */
exports.verify = function (req, res) {
  User.findOne({
    activeAccountToken: req.params.token
  }, function (err, user) {
    if (!user) {
      // Kiểm tra nếu user không tồn tại
      return res.redirect('/authentication/error?err=1');
    } else {
      var now = new Date().getTime();
      var date = new Date(user.resetPasswordExpires).getTime();
      // Kiểm tra nếu token đã hết hạn
      if (date < now)
        return res.redirect('/authentication/error?err=2');
      // Kiểm tra nếu user đã bị block
      if (user.status === 3)
        return res.redirect('/authentication/error?err=3');
      // Kiểm tra nếu user là account social
      if (user.provider !== 'local')
        return res.redirect('/authentication/error?err=4');
      user.status = 2;
      user.activeAccountToken = undefined;
      user.resetPasswordExpires = undefined;
      user.save(function (err, user) {
        var report = new Userreport({ user: user._id });
        var login = new Userlogin({ user: user._id });
        login.agent = req.headers['user-agent'];
        login.ip = getClientIp(req);
        login.save();
        report.save();
        user.password = undefined;
        user.salt = undefined;
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            // res.json(user);
            return res.redirect('/');
          }
        });
      });
    }
  });
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    if (req.query && req.query.redirect_to)
      req.session.redirect_to = req.query.redirect_to;
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    // if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
    //   req.session.redirect_to = req.query.redirect_to;
    // }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, info) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(info.redirect_to || '/');
        // return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          // var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
          user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            displayName: providerUserProfile.displayName,
            email: providerUserProfile.email,
            profileImageURL: providerUserProfile.profileImageURL,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData
          });
          // And save the user
          user.save(function (err, _user) {
            if (!err) {
              var report = new Userreport({ user: _user._id });
              var login = new Userlogin({ user: _user._id });
              login.agent = req.headers['user-agent'];
              login.ip = getClientIp(req);
              login.save();
              report.save();
            }
            return done(err, user);
          });

          // User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
          //   user = new User({
          //     firstName: providerUserProfile.firstName,
          //     lastName: providerUserProfile.lastName,
          //     username: availableUsername,
          //     displayName: providerUserProfile.displayName,
          //     email: providerUserProfile.email,
          //     profileImageURL: providerUserProfile.profileImageURL,
          //     provider: providerUserProfile.provider,
          //     providerData: providerUserProfile.providerData
          //   });

          //   // And save the user
          //   user.save(function (err, _user) {
          //     if (!err) {
          //       var report = new Userreport({ user: _user._id });
          //       var login = new Userlogin({ user: _user._id });
          //       login.agent = req.headers['user-agent'];
          //       login.ip =
          //         req.headers['X-Forwarded-For'] ||
          //         req.headers['x-forwarded-for'] ||
          //         req.client.remoteAddress;
          //       login.save();
          //       report.save();
          //     }
          //     return done(err, user);
          //   });
          // });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};

function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
}
// function verifyEmail(email) {
//   if (email.length === 0) return reject(new Error('LB_USER_EMAIL_REQUIRED'));
//   if (!validator.isEmail(email)) return reject(new Error('LB_USER_EMAIL_INVALID'));
//   User.findOne({ email: email })
//     .then(user => {
//       if (user) {
//         // Kiểm tra trạng thái user đã active
//         if (user.status === 1) {
//           return reject(new Error('MS_USERS_SIGNUP_NOTACTIVE'));
//         }
//         if (user.status === 2 || user.status === 3) {
//           return reject(new Error('LB_USERS_EMAIL_DUPLICATE'));
//         }
//       }
//       return resolve();
//     }, err => {
//       return reject(err);
//     });
// }
// function gen_token() {
//   return new Promise((resolve, reject) => {
//     crypto.randomBytes(20, function (err, buffer) {
//       if (err) return reject(new Error('MS_CM_LOAD_ERROR'));
//       var token = buffer.toString('hex');
//       return resolve(token);
//     });
//   });
// }
// function render_main_content(token, user, host, res) {
//   return new Promise((resolve, reject) => {
//     var httpTransport = 'http://';
//     if (config.secure && config.secure.ssl === true) {
//       httpTransport = 'https://';
//     }
//     res.render(path.resolve('modules/users/server/templates/verify-email'), {
//       name: user.displayName,
//       appName: config.app.title,
//       url: httpTransport + host + '/api/auth/verify/' + token
//     }, function (err, emailHTML) {
//       console.log(err);
//       console.log(emailHTML);
//       if (err) return reject(new Error('MS_CM_LOAD_ERROR'));
//       return resolve({ html: emailHTML, user: user });
//     });
//   });
// }
// function send_verification(emailHTML, user) {
//   return new Promise((resolve, reject) => {
//     var mailOptions = {
//       to: user.email,
//       from: config.mailer.account.from,
//       subject: 'Verify your account',
//       html: emailHTML
//     };
//     smtpTransport.sendMail(mailOptions, function (err) {
//       if (!err) {
//         return resolve('MS_USERS_SEND_SUCCESS');
//       } else {
//         return reject(new Error('MS_USERS_SEND_FAIL'));
//       }
//     });
//   });
// }