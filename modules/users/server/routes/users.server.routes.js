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

  app.route('/api/profile/:userId').get(users.profile);
  app.route('/api/profile/:userId/polls/:page').get(users.polls);
  app.route('/api/profile/:userId/cmts/:page').get(users.cmts);
  app.route('/api/profile/:userId/likes/:page').get(users.likes);
  app.route('/api/profile/:userId/dislikes/:page').get(users.dislikes);
  app.route('/api/profile/:userId/bookmarks/:page').get(users.bookmarks);
  app.route('/api/profile/:userId/follows/:page').get(users.follows);
  app.route('/api/profile/:userId/votes/:page').get(users.votes);
  app.route('/api/profile/:userId/views/:page').get(users.views);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
