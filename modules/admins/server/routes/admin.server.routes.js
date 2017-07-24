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
  // Lấy danh sách user cho page admin.user.list
  app.route('/api/admins/users').get(adminPolicy.isAllowed, admin.users_list);
  
  app.route('/api/admins/users/:aduserId/resetpass').post(adminPolicy.isAllowed, admin.user_resetpass);
  app.route('/api/admins/users/:aduserId/report').get(adminPolicy.isAllowed, admin.users_report);
  app.route('/api/admins/users/:aduserId/reported').get(adminPolicy.isAllowed, admin.users_reported);
  app.route('/api/admins/users/:aduserId/polls').get(adminPolicy.isAllowed, admin.users_polls);
  app.route('/api/admins/users/:aduserId/cmts').get(adminPolicy.isAllowed, admin.users_cmts);
  app.route('/api/admins/users/:aduserId/votes').get(adminPolicy.isAllowed, admin.users_votes);
  app.route('/api/admins/users/:aduserId/reports').get(adminPolicy.isAllowed, admin.users_reports);
  app.route('/api/admins/users/:aduserId/bereports').get(adminPolicy.isAllowed, admin.users_bereports);
  app.route('/api/admins/users/:aduserId/suggests').get(adminPolicy.isAllowed, admin.users_suggests);

  // Finish by binding the user middleware
  app.param('aduserId', admin.userByID);
};
