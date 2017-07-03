// Bookmarks service used to communicate Bookmarks REST endpoints
(function () {
  'use strict';

  angular
    .module('bookmarks')
    .factory('BookmarksService', BookmarksService);

  BookmarksService.$inject = ['$resource'];

  function BookmarksService($resource) {
    return $resource('api/bookmarks/:bookmarkId', {
      bookmarkId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
