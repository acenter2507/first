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
var httpTransport = 'http://';
if (config.secure && config.secure.ssl === true) {
  httpTransport = 'https://';
}
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
      // user.activeAccountExpires = Date.now() + 1800000; //86400000; // 24h
      user.status = 1;
      user.save(function (err, _user) {
        if (err)
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        user = _user;
        user.password = undefined;
        user.salt = undefined;
        done(err, token, user);
      });
    },
    function (token, user, done) {
      var url = httpTransport + req.headers.host + '/api/auth/verify/' + token;
      var mailTemplate = new EmailTemplate(path.join('modules/users/server/templates', 'verification'));
      var mailContent = {
        name: user.displayName,
        appName: config.app.title,
        url: url
      };
      mailTemplate.render(mailContent, function (err, result) {
        if (err)
          return res.status(400).send({ message: 'MS_USERS_SEND_FAIL' });
        var mailOptions = {
          from: config.app.title + '<' + config.mailer.account.from + '>',
          to: user.email,
          subject: 'Verify your account',
          html: result.html
        };
        transporter.sendMail(mailOptions, function (err) {
          if (!err) {
            return res.json({ success: true });
          } else {
            return res.status(400).send({
              message: 'MS_USERS_SEND_FAIL'
            });
          }
          done();
        });
      });
    }
  ], function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
  });
};

/**
 * Resend
 */
exports.resend = function (req, res) {
  // Init Variables
  var email = req.body.email || '';
  User.findOne({ email: email }, function (err, user) {
    if (err)
      return res.status(400).send({
        message: 'MS_CM_LOAD_ERROR'
      });
    if (!user)
      return res.status(400).send({
        message: 'MS_USERS_NOT_EXIST'
      });
    if (user.status === 2 || user.status === 3)
      return res.status(400).send({
        message: 'MS_USERS_ACTIVED'
      });
    crypto.randomBytes(20, function (err, buffer) {
      if (err)
        return res.status(400).send({
          message: 'MS_CM_LOAD_ERROR'
        });
      var token = buffer.toString('hex');
      user.activeAccountToken = token;
      var url = httpTransport + req.headers.host + '/api/auth/verify/' + token;
      var mailTemplate = new EmailTemplate(path.join('modules/users/server/templates', 'verification'));
      var mailContent = {
        name: user.displayName,
        appName: config.app.title,
        url: url
      };
      mailTemplate.render(mailContent, function (err, result) {
        if (err)
          return res.status(400).send({ message: 'MS_USERS_SEND_FAIL' });
        var mailOptions = {
          from: config.app.title + '<' + config.mailer.account.from + '>',
          to: user.email,
          subject: 'Verify your account',
          html: result.html
        };
        transporter.sendMail(mailOptions, function (err) {
          if (!err) {
            user.save((err, user) => {
              if (err)
                return res.status(400).send({ message: 'MS_USERS_SEND_FAIL' });
              return res.json({ success: true });
            });
          } else {
            return res.status(400).send({
              message: 'MS_USERS_SEND_FAIL'
            });
          }
        });
      });
    });
  });

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
      return res.redirect('/verification/error?err=1');
    } else {
      // Kiểm tra nếu user đã bị block
      if (user.status === 3)
        return res.redirect('/verification/error?err=2');
      // Kiểm tra nếu user là account social
      if (user.provider !== 'local')
        return res.redirect('/verification/error?err=3');
      user.status = 2;
      user.activeAccountToken = undefined;
      // user.activeAccountExpires = undefined;
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
      console.log(err);
      console.log(user);
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

    console.log('Has no user in request');
    User.findOne({ email: providerUserProfile.email }, function (err, _user) {
      if (_user) {
        console.log('Has user of email');
        var __user = new User(_user);
        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (__user.provider !== providerUserProfile.provider && (!__user.additionalProvidersData || !__user.additionalProvidersData[providerUserProfile.provider])) {
          // Add the provider data to the additional provider data field
          if (!__user.additionalProvidersData) {
            __user.additionalProvidersData = {};
          }

          __user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

          // Then tell mongoose that we've updated the additionalProvidersData field
          __user.markModified('additionalProvidersData');

          // And save the user
          __user.save(function (err, user) {
            console.log('Save user');
            return done(err, user);
          });
        } else {
          return done(err, __user);
        }
      } else {
        console.log('Has no user of email');
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
                status: 2,
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
            } else {
              return done(err, user);
            }
          }
        });
      }
    });
  } else {
    console.log('Has user in request');
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
      return done(new Error('MS_USERS_SOCIAL_EXIST'), user);
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