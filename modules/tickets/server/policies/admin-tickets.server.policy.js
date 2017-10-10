'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/tickets',
      permissions: '*'
    }, {
      resources: '/api/tickets/:ticketId',
      permissions: '*'
    }, {
      resources: '/api/tickets/:ticketId/send',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = function (req, res, next) {
 
  if (!req.user) return res.status(403).send(new Error('User is not authorized'));
  var roles = (req.user) ? req.user.roles : ['guest'];
  if (roles.indexOf('admin') < 0) return res.status(403).send(new Error('User is not authorized'));
  return next();
};

