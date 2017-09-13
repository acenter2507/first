'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  mail = require(path.resolve('./config/lib/mail')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  Userreport = mongoose.model('Userreport'),
  Userlogin = mongoose.model('Userlogin'),
  crypto = require('crypto'),
  async = require('async'),
  validator = require('validator');

exports.signup = function (req, res) {
  delete req.body.roles;
  var user = new User(req.body);
  user.provider = 'local';

  // Validate EMAIL
  validEmail(user.email)
    .then(() => {
      return getToken();
    })
    .then(token => {
      user.activeAccountToken = token;
      user.status = 1;
      // user.activeAccountExpires = Date.now() + 1800000; //86400000; // 24h
      return saveUser(user);
    })
    .then(_user => {
      var url = config.http + '://' + req.headers.host + '/api/auth/verify/' + _user.activeAccountToken;
      var mailTemplate = 'verification';
      var mailContent = {
        name: _user.displayName,
        appName: config.app.title,
        url: url
      };
      var mailOptions = {
        from: config.app.title + '<' + config.mailer.account.from + '>',
        to: _user.email,
        subject: 'Verify your account'
      };
      return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
    })
    .then(() => {
      return res.json({ success: true });
    })
    .catch(handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Resend
 */
exports.resend = function (req, res) {
  // Init Variables
  var email = req.body.email || '';
  User.findOne({ email: email }, function (err, user) {
    if (err) return handleError(new Error('MS_CM_LOAD_ERROR'));
    if (!user) return handleError(new Error('MS_USERS_NOT_EXIST'));
    if (user.status === 2 || user.status === 3)
      return handleError(new Error('MS_USERS_ACTIVED'));
    getToken()
      .then(token => {
        user.activeAccountToken = token;
        return saveUser(user);
      })
      .then(_user => {
        var url = config.http + '://' + req.headers.host + '/api/auth/verify/' + _user.activeAccountToken;
        var mailTemplate = 'verification';
        var mailContent = {
          name: _user.displayName,
          appName: config.app.title,
          url: url
        };
        var mailOptions = {
          from: config.app.title + '<' + config.mailer.account.from + '>',
          to: _user.email,
          subject: 'Verify your account'
        };
        return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
      })
      .then(() => {
        return res.json({ success: true });
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
 * Verify
 */
exports.twitter = function (req, res) {
  if (!req.body.user || req.body.email)
    return res.redirect('/authentication/signin');
  User.findOne({
    _id: req.body.user
  }, function (err, user) {
    if (err || !user)
      return res.redirect('/authentication/signin');
    user.email = req.body.email;
    saveUser(user)
      .then(user => {
        req.login(user, function (err) {
          if (err) return res.status(400).send(err);
          return res.redirect('/');
        });
      })
      .catch(err => {
        return res.status(400).send(err);
      });
  });
};
/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    if (req.query && req.query.redirect_to)
      req.session.redirect_to = req.query.redirect_to;
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
    delete req.session.redirect_to;
    passport.authenticate(strategy, function (err, user, info) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      } else if (!user) {
        return res.redirect('/authentication/signin');
      }
      if (strategy === 'twitter' && user.new)
        return res.redirect('/authentication/twitter?social=' + user._id);
      user.salt = undefined;
      user.password = undefined;
      user.new = undefined;
      req.login(user, function (err) {
        if (err) return res.redirect('/authentication/signin');
        return res.redirect(info.redirect_to || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {

    User.findOne({ email: providerUserProfile.email }, function (err, _user) {
      if (_user) {
        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (_user.provider !== providerUserProfile.provider && (!_user.additionalProvidersData || !_user.additionalProvidersData[providerUserProfile.provider])) {
          // Add the provider data to the additional provider data field
          if (!_user.additionalProvidersData) {
            _user.additionalProvidersData = {};
          }

          _user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

          // Then tell mongoose that we've updated the additionalProvidersData field
          _user.markModified('additionalProvidersData');

          _user.save(function (err, user) {
            return done(err, user);
          });
        } else {
          return done(err, _user);
        }
      } else {
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
                _user.new = true;
                return done(err, _user);
              });
            } else {
                user.new = false;
              return done(err, user);
            }
          }
        });
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

function validEmail(email) {
  return new Promise((resolve, reject) => {
    if (email.length === 0)
      return reject(new Error('LB_USER_EMAIL_REQUIRED'));
    if (!validator.isEmail(email))
      return reject(new Error('LB_USER_EMAIL_INVALID'));
    User.findOne({ email: email }, function (err, user) {
      if (err)
        return reject(new Error('MS_CM_LOAD_ERROR'));
      // Kiểm tra trạng thái user đã active
      if (user) {
        if (user.status === 1)
          return reject(new Error('MS_USERS_SIGNUP_NOTACTIVE'));
        return reject(new Error('LB_USERS_EMAIL_DUPLICATE'));
      }
      return resolve();
    });
  });
}
function getToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, function (err, buffer) {
      if (err) {
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