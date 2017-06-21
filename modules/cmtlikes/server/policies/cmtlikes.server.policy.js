'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Cmtlikes Permissions
 */
exports.invokeRolesPolicies = function() {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/cmtlikes',
      permissions: '*'
    }, {
      resources: '/api/cmtlikes/:cmtlikeId',
      permissions: '*'
    }, {
      resources: '/api/cmtlike/:cmtId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/cmtlikes',
      permissions: ['get', 'post']
    }, {
      resources: '/api/cmtlikes/:cmtlikeId',
      permissions: ['get']
    }, {
      resources: '/api/cmtlike/:cmtId',
      permissions: '*'
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/cmtlikes',
      permissions: ['get']
    }, {
      resources: '/api/cmtlikes/:cmtlikeId',
      permissions: ['get']
    }, {
      resources: '/api/cmtlike/:cmtId',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Cmtlikes Policy Allows
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Cmtlike is being processed and the current user created it then allow any manipulation
  if (req.cmtlike && req.user && req.cmtlike.user && req.cmtlike.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
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
