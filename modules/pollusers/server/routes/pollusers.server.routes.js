'use strict';

/**
 * Module dependencies
 */
var pollusersPolicy = require('../policies/pollusers.server.policy'),
  pollusers = require('../controllers/pollusers.server.controller');

module.exports = function(app) {
  // Pollusers Routes
  app.route('/api/pollusers').all(pollusersPolicy.isAllowed)
    .get(pollusers.list)
    .post(pollusers.create);

  app.route('/api/pollusers/:polluserId').all(pollusersPolicy.isAllowed)
    .get(pollusers.read)
    .put(pollusers.update)
    .delete(pollusers.delete);

  // Finish by binding the Polluser middleware
  app.param('polluserId', pollusers.polluserByID);
};
