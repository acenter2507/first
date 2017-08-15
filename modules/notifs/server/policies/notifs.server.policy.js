'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Notifs Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/notifs',
          permissions: '*'
        },
        {
          resources: '/api/notifs/:notifId',
          permissions: '*'
        },
        {
          resources: '/api/countUnchecks',
          permissions: '*'
        },
        {
          resources: '/api/findNotifs/:limit/page',
          permissions: '*'
        },
        {
          resources: '/api/markAllRead',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        {
          resources: '/api/notifs',
          permissions: ['get', 'post']
        },
        {
          resources: '/api/notifs/:notifId',
          permissions: '*'
        },
        {
          resources: '/api/countUnchecks',
          permissions: '*'
        },
        {
          resources: '/api/findNotifs/:limit/page',
          permissions: '*'
        },
        {
          resources: '/api/markAllRead',
          permissions: '*'
        }
      ]
    }
  ]);
};

/**
 * Check If Notifs Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = req.user ? req.user.roles : ['guest'];

  // If an Notif is being processed and the current user created it then allow any manipulation
  if (
    req.notif && req.user && req.notif.to && req.notif.to.id === req.user.id
  ) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(
    roles,
    req.route.path,
    req.method.toLowerCase(),
    function (err, isAllowed) {
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
    }
  );
};
