'use strict';

exports.invokeRolesPolicies = function () {
  return;
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
