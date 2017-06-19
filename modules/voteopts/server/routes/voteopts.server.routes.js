'use strict';

/**
 * Module dependencies
 */
var voteoptsPolicy = require('../policies/voteopts.server.policy'),
  voteopts = require('../controllers/voteopts.server.controller');

module.exports = function(app) {
  // Voteopts Routes
  app.route('/api/voteopts').all(voteoptsPolicy.isAllowed)
    .get(voteopts.list)
    .post(voteopts.create);

  app.route('/api/voteopts/:voteoptId').all(voteoptsPolicy.isAllowed)
    .get(voteopts.read)
    .put(voteopts.update)
    .delete(voteopts.delete);

  // Finish by binding the Voteopt middleware
  app.param('voteoptId', voteopts.voteoptByID);
};
