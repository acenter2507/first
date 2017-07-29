'use strict';

/**
 * Module dependencies
 */
var tagsPolicy = require('../policies/tags.server.policy'),
  tags = require('../controllers/tags.server.controller');

module.exports = function(app) {
  // Tags Routes
  app.route('/api/tags/popular').get(tags.popular);

  app.route('/api/tags').all(tagsPolicy.isAllowed)
    .get(tags.list)
    .post(tags.create);

  app.route('/api/tags/:tagId').all(tagsPolicy.isAllowed)
    .get(tags.read)
    .put(tags.update)
    .delete(tags.delete);

  // Finish by binding the Tag middleware
  app.param('tagId', tags.tagByID);
};
