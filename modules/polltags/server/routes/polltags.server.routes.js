'use strict';

/**
 * Module dependencies
 */
var polltagsPolicy = require('../policies/polltags.server.policy'),
  polltags = require('../controllers/polltags.server.controller');

module.exports = function(app) {
  // Polltags Routes
  app.route('/api/polltags').all(polltagsPolicy.isAllowed)
    .get(polltags.list)
    .post(polltags.create);

  app.route('/api/polltags/:polltagId').all(polltagsPolicy.isAllowed)
    .get(polltags.read)
    .put(polltags.update)
    .delete(polltags.delete);

  // Finish by binding the Polltag middleware
  app.param('polltagId', polltags.polltagByID);
};
