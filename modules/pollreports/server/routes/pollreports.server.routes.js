'use strict';

/**
 * Module dependencies
 */
var pollreportsPolicy = require('../policies/pollreports.server.policy'),
  pollreports = require('../controllers/pollreports.server.controller');

module.exports = function(app) {
  // Pollreports Routes
  app.route('/api/pollreports')
    .get(pollreports.list)
    .post(pollreports.create);

  app.route('/api/pollreports/:pollreportId')
    .get(pollreports.read)
    .put(pollreports.update)
    .delete(pollreports.delete);

  // Finish by binding the Pollreport middleware
  app.param('pollreportId', pollreports.pollreportByID);
};
