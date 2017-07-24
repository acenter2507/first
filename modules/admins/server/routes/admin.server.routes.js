'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('../../../users/server/routes/users.server.routes.js')(app);

  /* Users manage */
  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.users)
    .post(adminPolicy.isAllowed, admin.user_add);
  // Single user routes
  app.route('/api/users/:aduserId')
    .get(adminPolicy.isAllowed, admin.user)
    .put(adminPolicy.isAllowed, admin.user_update)
    .delete(adminPolicy.isAllowed, admin.user_delete);

  // app.route('/api/admins/users/:aduserId/picture').post(adminPolicy.isAllowed, admin.users_profile_image);
  app.route('/api/admins/users/:aduserId/resetpass').get(adminPolicy.isAllowed, admin.user_resetpass);
  app.route('/api/admins/users/:aduserId/report').get(adminPolicy.isAllowed, admin.users_report);
  app.route('/api/admins/users/:aduserId/reported').get(adminPolicy.isAllowed, admin.users_reported);

  // Finish by binding the user middleware
  app.param('aduserId', admin.userByID);
};
