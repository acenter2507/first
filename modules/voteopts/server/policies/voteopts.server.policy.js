'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Voteopts Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/voteopts',
      permissions: '*'
    }, {
      resources: '/api/voteopts/:voteoptId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/voteopts',
      permissions: ['get', 'post']
    }, {
      resources: '/api/voteopts/:voteoptId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/voteopts',
      permissions: ['get']
    }, {
      resources: '/api/voteopts/:voteoptId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Voteopts Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Voteopt is being processed and the current user created it then allow any manipulation
  if (req.voteopt && req.user && req.voteopt.user && req.voteopt.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
