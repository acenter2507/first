'use strict';

/**
 * Module dependencies
 */
var viewsPolicy = require('../policies/views.server.policy'),
  views = require('../controllers/views.server.controller');

module.exports = function(app) {
  // Views Routes
  app.route('/api/views').all(viewsPolicy.isAllowed)
    .get(views.list)
    .post(views.create);

  app.route('/api/views/:viewId').all(viewsPolicy.isAllowed)
    .get(views.read)
    .put(views.update)
    .delete(views.delete);

  // Finish by binding the View middleware
  app.param('viewId', views.viewByID);
};
