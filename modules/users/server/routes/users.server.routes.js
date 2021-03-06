'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  // Thay đổi thông tin user
  app.route('/api/users').put(users.update);
  // Xóa tài khoản social
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  // Đổi mật khẩu
  app.route('/api/users/password').post(users.changePassword);
  // Thay đổi hình ảnh của user
  app.route('/api/users/picture').post(users.changeProfilePicture);
  // Thay đổi ngôn ngữ user
  app.route('/api/users/language').post(users.changeLanguage);
  // Tim user theo tên
  app.route('/api/users/search').get(users.search_user_by_name);

  // Lấy thông tin của user đang được xem profile page
  app.route('/api/profile/:profileId').get(users.profile);
  // Lấy hoạt động của user
  app.route('/api/profile/:profileId/activitys').get(users.activitys);
  // Tăng biến đếm số lần xem profile của user
  app.route('/api/profile/:profileId/be_view').get(users.countUpBeView);
  // Xóa hết poll đã bookmark
  app.route('/api/profile/:profileId/clear_bookmark').get(users.clear_bookmark);
  // Xóa hết poll đã view
  app.route('/api/profile/:profileId/clear_view').get(users.clear_view);
  // Xóa hết poll đã follow
  app.route('/api/profile/:profileId/clear_follow').get(users.clear_follow);
  // Màn hình home lấy top user
  app.route('/api/profile/top/:limit').get(users.loadTopUsers);

  app.route('/api/profile/:profileId/polls/:page').get(users.loadProfilePolls);
  app.route('/api/profile/:profileId/cmts/:page').get(users.loadProfileComments);
  app.route('/api/profile/:profileId/votes/:page').get(users.loadProfileVotes);
  app.route('/api/profile/:profileId/likes/:page').get(users.loadProfileLikedPolls);
  app.route('/api/profile/:profileId/dislikes/:page').get(users.loadProfileDislikedPolls);
  app.route('/api/profile/:profileId/bookmarks/:page').get(users.loadProfileBookmarks);
  app.route('/api/profile/:profileId/follows/:page').get(users.loadProfileFollows);
  app.route('/api/profile/:profileId/views/:page').get(users.loadProfileViews);


  // Finish by binding the user middleware
  app.param('profileId', users.profileById);
};
