'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin-users.server.policy'),
  adminController = require('../controllers/admin-users.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  /* Users manage */
  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, adminController.users)
    .post(adminPolicy.isAllowed, adminController.user_add);
  // Single user routes
  app.route('/api/users/:aduserId')
    .get(adminPolicy.isAllowed, adminController.user)
    .put(adminPolicy.isAllowed, adminController.user_update)
    .delete(adminPolicy.isAllowed, adminController.user_delete);

  // app.route('/api/admins/users/:aduserId/picture').post(adminPolicy.isAllowed, admin.users_profile_image);
  // Lấy danh sách user cho page admin.user.list
  app.route('/api/admins/users/search').post(adminPolicy.isAllowed, adminController.loadAdminUsers);
  // Tự động tạo user
  app.route('/api/admins/users/generate/:number/:pass').get(adminPolicy.isAllowed, adminController.generateUsers);
  // Lấy danh sách polls của user cho page admin.user.view
  app.route('/api/admins/users/:aduserId/polls').get(adminPolicy.isAllowed, adminController.users_polls);

  app.route('/api/admins/users/:aduserId/resetpass').post(adminPolicy.isAllowed, adminController.resetPassword);
  // app.route('/api/admins/users/:aduserId/report').get(adminPolicy.isAllowed, admin.users_report);
  // app.route('/api/admins/users/:aduserId/reported').get(adminPolicy.isAllowed, admin.users_reported);
  app.route('/api/admins/users/:aduserId/cmts').get(adminPolicy.isAllowed, adminController.users_cmts);
  app.route('/api/admins/users/:aduserId/votes').get(adminPolicy.isAllowed, adminController.users_votes);
  app.route('/api/admins/users/:aduserId/reports').get(adminPolicy.isAllowed, adminController.users_reports);
  app.route('/api/admins/users/:aduserId/bereports').get(adminPolicy.isAllowed, adminController.users_bereports);
  app.route('/api/admins/users/:aduserId/suggests').get(adminPolicy.isAllowed, adminController.users_suggests);
  // Lấy danh sách logins của user
  app.route('/api/admins/users/:aduserId/logins').post(adminPolicy.isAllowed, adminController.loadAdminUserLogins);

  // Finish by binding the user middleware
  app.param('aduserId', adminController.userByID);
};
