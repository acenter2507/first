'use strict';

/**
 * Module dependencies
 */
var followsPolicy = require('../policies/follows.server.policy'),
  follows = require('../controllers/follows.server.controller');

module.exports = function(app) {
  // follows Routes
  app.route('/api/follows').all(followsPolicy.isAllowed)
    .get(follows.list)
    .post(follows.create);

  app.route('/api/follows/:followId').all(followsPolicy.isAllowed)
    .get(follows.read)
    .put(follows.update)
    .delete(follows.delete);

  // Finish by binding the follow middleware
  app.param('followId', follows.followByID);
};
