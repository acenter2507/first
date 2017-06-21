'use strict';

/**
 * Module dependencies
 */
var likesPolicy = require('../policies/likes.server.policy'),
  likes = require('../controllers/likes.server.controller');

module.exports = function(app) {
  // Likes Routes
  app.route('/api/likes').all(likesPolicy.isAllowed)
    .get(likes.list)
    .post(likes.create);

  app.route('/api/likes/:likeId').all(likesPolicy.isAllowed)
    .get(likes.read)
    .put(likes.update)
    .delete(likes.delete);

  // Finish by binding the Like middleware
  app.param('likeId', likes.likeByID);
};
