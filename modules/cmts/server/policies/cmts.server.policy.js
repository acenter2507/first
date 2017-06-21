'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Cmts Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/cmts',
      permissions: '*'
    }, {
      resources: '/api/cmts/:cmtId',
      permissions: '*'
    }, {
      resources: '/api/findLike/:cmtId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/cmts',
      permissions: ['get', 'post']
    }, {
      resources: '/api/cmts/:cmtId',
      permissions: ['get']
    }, {
      resources: '/api/findLike/:cmtId',
      permissions: '*'
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/cmts',
      permissions: ['get']
    }, {
      resources: '/api/cmts/:cmtId',
      permissions: ['get']
    }, {
      resources: '/api/findLike/:cmtId',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Cmts Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  console.log('req.cmt', req.cmt);
  console.log('req.cmt.user.id', req.cmt.user.id);
  console.log('req.user.id',req.user.id);
  // If an Cmt is being processed and the current user created it then allow any manipulation
  if (req.cmt && req.user && req.cmt.user && req.cmt.user.id === req.user.id) {
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
