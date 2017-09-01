'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  Userreport = mongoose.model('Userreport'),
  Userlogin = mongoose.model('Userlogin');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init Variables
  var user = new User(req.body);
  var message = null;

  if (!user.verifyEmail()) {
    return res.status(400).send({
      message: 'MS_USERS_EMAIL_DUPLICATE'
    });
  }
  user.provider = 'local';

  // Add missing user fields
  // user.provider = 'local';
  // user.displayName = user.firstName + ' ' + user.lastName;
  user.save(function (err, user) {
    if (err) return handleError(err);
    // Remove sensitive data before login
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
        res.json(user);
      }
    });
  });

  //   }
  // });
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