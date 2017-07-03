'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Bookmarks Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/bookmarks',
      permissions: '*'
    }, {
      resources: '/api/bookmarks/:bookmarkId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/bookmarks',
      permissions: ['get', 'post']
    }, {
      resources: '/api/bookmarks/:bookmarkId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/bookmarks',
      permissions: ['get']
    }, {
      resources: '/api/bookmarks/:bookmarkId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Bookmarks Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Bookmark is being processed and the current user created it then allow any manipulation
  if (req.bookmark && req.user && req.bookmark.user && req.bookmark.user.id === req.user.id) {
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
