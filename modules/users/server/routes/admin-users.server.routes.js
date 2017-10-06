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
  // Reset password cho user
  app.route('/api/admins/users/:aduserId/resetpass').post(adminPolicy.isAllowed, adminController.resetPassword);
  // Lấy danh sách polls của user cho page admin.user.view
  app.route('/api/admins/users/:aduserId/polls').post(adminPolicy.isAllowed, adminController.loadAdminUserPolls);
  // Lấy danh sách comment của user
  app.route('/api/admins/users/:aduserId/cmts').post(adminPolicy.isAllowed, adminController.loadAdminUserComments);
  // Lấy danh sách các lần tham gia vote
  app.route('/api/admins/users/:aduserId/votes').post(adminPolicy.isAllowed, adminController.loadAdminUserVotes);
  // Lấy danh sách các lần like/dislike
  app.route('/api/admins/users/:aduserId/likes').post(adminPolicy.isAllowed, adminController.loadAdminUserLikes);

  // app.route('/api/admins/users/:aduserId/report').get(adminPolicy.isAllowed, admin.users_report);
  // app.route('/api/admins/users/:aduserId/reported').get(adminPolicy.isAllowed, admin.users_reported);
  app.route('/api/admins/users/:aduserId/reports').get(adminPolicy.isAllowed, adminController.users_reports);
  app.route('/api/admins/users/:aduserId/bereports').get(adminPolicy.isAllowed, adminController.users_bereports);
  app.route('/api/admins/users/:aduserId/suggests').get(adminPolicy.isAllowed, adminController.users_suggests);
  // Lấy danh sách logins của user
  app.route('/api/admins/users/:aduserId/logins').post(adminPolicy.isAllowed, adminController.loadAdminUserLogins);

  // Finish by binding the user middleware
  app.param('aduserId', adminController.userByID);
};
