'use strict';

/**
 * Module dependencies
 */
var votesPolicy = require('../policies/votes.server.policy'),
  votes = require('../controllers/votes.server.controller');

module.exports = function(app) {
  // Votes Routes
  app.route('/api/votes').all(votesPolicy.isAllowed)
    .get(votes.list)
    .post(votes.create);

  app.route('/api/votes/:voteId').all(votesPolicy.isAllowed)
    .get(votes.read)
    .put(votes.update)
    .delete(votes.delete);

  app.route('/api/findOpts/:voteId').get(votes.findOpts);

  // Finish by binding the Vote middleware
  app.param('voteId', votes.voteByID);
};
