'use strict';

/**
 * Module dependencies
 */
var bookmarksPolicy = require('../policies/bookmarks.server.policy'),
  bookmarks = require('../controllers/bookmarks.server.controller');

module.exports = function(app) {
  // Bookmarks Routes
  app.route('/api/bookmarks').all(bookmarksPolicy.isAllowed)
    .get(bookmarks.list)
    .post(bookmarks.create);

  app.route('/api/bookmarks/:bookmarkId').all(bookmarksPolicy.isAllowed)
    .get(bookmarks.read)
    .put(bookmarks.update)
    .delete(bookmarks.delete);

  // Finish by binding the Bookmark middleware
  app.param('bookmarkId', bookmarks.bookmarkByID);
};
