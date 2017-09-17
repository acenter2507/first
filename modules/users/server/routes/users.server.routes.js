'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/users/language').post(users.changeLanguage);
  app.route('/api/users/search').get(users.search_user_by_name);
  app.route('/api/users/best/:limit').get(users.get_best_users);

  // Lấy thông tin của user đang được xem profile page
  app.route('/api/profile/:profileId').get(users.profile);
  app.route('/api/profile/:profileId/activitys').get(users.activitys);


  app.route('/api/profile/:profileId/polls/:page').get(users.polls);
  app.route('/api/profile/:profileId/cmts/:page').get(users.cmts);
  app.route('/api/profile/:profileId/votes/:page').get(users.votes);
  app.route('/api/profile/:profileId/likes/:page').get(users.likes);
  app.route('/api/profile/:profileId/dislikes/:page').get(users.dislikes);
  app.route('/api/profile/:profileId/bookmarks/:page').get(users.bookmarks);
  app.route('/api/profile/:profileId/follows/:page').get(users.follows);
  app.route('/api/profile/:profileId/views/:page').get(users.views);
  app.route('/api/profile/:profileId/report').get(users.report);
  app.route('/api/profile/:profileId/clear_bookmark').get(users.clear_bookmark);
  app.route('/api/profile/:profileId/clear_view').get(users.clear_view);
  app.route('/api/profile/:profileId/clear_follow').get(users.clear_follow);

  app.route('/api/userreports')
    .post(users.create_report);
  app.route('/api/userreports/:userreportId')
    .get(users.read_report)
    .put(users.update_report);

  // Finish by binding the user middleware
  app.param('profileId', users.profileById);
  app.param('userreportId', users.reportByID);
};
