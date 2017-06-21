'use strict';

/**
 * Module dependencies
 */
var cmtlikesPolicy = require('../policies/cmtlikes.server.policy'),
  cmtlikes = require('../controllers/cmtlikes.server.controller');

module.exports = function(app) {
  // Cmtlikes Routes
  app.route('/api/cmtlikes').all(cmtlikesPolicy.isAllowed)
    .get(cmtlikes.list)
    .post(cmtlikes.create);

  app.route('/api/cmtlikes/:cmtlikeId').all(cmtlikesPolicy.isAllowed)
    .get(cmtlikes.read)
    .put(cmtlikes.update)
    .delete(cmtlikes.delete);

  app.route('/api/cmtlike/:cmtId').all(cmtlikesPolicy.isAllowed)
    .get(cmtlikes.findCmtlike)
    .put(cmtlikes.saveCmtlike);

  // Finish by binding the Cmtlike middleware
  app.param('cmtlikeId', cmtlikes.cmtlikeByID);
};
