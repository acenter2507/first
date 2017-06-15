'use strict';

/**
 * Module dependencies
 */
var optsPolicy = require('../policies/opts.server.policy'),
  opts = require('../controllers/opts.server.controller');

module.exports = function(app) {
  // Opts Routes
  app.route('/api/opts').all(optsPolicy.isAllowed)
    .get(opts.list)
    .post(opts.create);

  app.route('/api/opts/:optId').all(optsPolicy.isAllowed)
    .get(opts.read)
    .put(opts.update)
    .delete(opts.delete);

  // Finish by binding the Opt middleware
  app.param('optId', opts.optByID);
};
