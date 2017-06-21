'use strict';

/**
 * Module dependencies
 */
var cmtsPolicy = require('../policies/cmts.server.policy'),
  cmts = require('../controllers/cmts.server.controller');

module.exports = function(app) {
  // Cmts Routes
  app.route('/api/cmts').all(cmtsPolicy.isAllowed)
    .get(cmts.list)
    .post(cmts.create);

  app.route('/api/cmts/:cmtId').all(cmtsPolicy.isAllowed)
    .get(cmts.read)
    .put(cmts.update)
    .delete(cmts.delete);

  app.route('/api/findLike/:cmtId').get(cmts.findLike);

  // Finish by binding the Cmt middleware
  app.param('cmtId', cmts.cmtByID);
};
