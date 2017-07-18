'use strict';

/**
 * Module dependencies
 */
var categorysPolicy = require('../policies/categorys.server.policy'),
  categorys = require('../controllers/categorys.server.controller');

module.exports = function(app) {
  // Categorys Routes
  app.route('/api/categorys').all(categorysPolicy.isAllowed)
    .get(categorys.list)
    .post(categorys.create);

  app.route('/api/categorys/:categoryId').all(categorysPolicy.isAllowed)
    .get(categorys.read)
    .put(categorys.update)
    .delete(categorys.delete);

  app.route('/api/count_polls/:categoryId').get(categorys.count_polls);
  app.route('/api/categorys/:categoryId/polls/:page/:sort').get(categorys.polls);

  // Finish by binding the Category middleware
  app.param('categoryId', categorys.categoryByID);
};
