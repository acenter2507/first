(function () {
  'use strict';

  angular
    .module('bookmarks')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('bookmarks', {
        abstract: true,
        url: '/bookmarks',
        template: '<ui-view/>'
      })
      .state('bookmarks.list', {
        url: '',
        templateUrl: 'modules/bookmarks/client/views/list-bookmarks.client.view.html',
        controller: 'BookmarksListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Bookmarks List'
        }
      })
      .state('bookmarks.create', {
        url: '/create',
        templateUrl: 'modules/bookmarks/client/views/form-bookmark.client.view.html',
        controller: 'BookmarksController',
        controllerAs: 'vm',
        resolve: {
          bookmarkResolve: newBookmark
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Bookmarks Create'
        }
      })
      .state('bookmarks.edit', {
        url: '/:bookmarkId/edit',
        templateUrl: 'modules/bookmarks/client/views/form-bookmark.client.view.html',
        controller: 'BookmarksController',
        controllerAs: 'vm',
        resolve: {
          bookmarkResolve: getBookmark
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Bookmark {{ bookmarkResolve.name }}'
        }
      })
      .state('bookmarks.view', {
        url: '/:bookmarkId',
        templateUrl: 'modules/bookmarks/client/views/view-bookmark.client.view.html',
        controller: 'BookmarksController',
        controllerAs: 'vm',
        resolve: {
          bookmarkResolve: getBookmark
        },
        data: {
          pageTitle: 'Bookmark {{ bookmarkResolve.name }}'
        }
      });
  }

  getBookmark.$inject = ['$stateParams', 'BookmarksService'];

  function getBookmark($stateParams, BookmarksService) {
    return BookmarksService.get({
      bookmarkId: $stateParams.bookmarkId
    }).$promise;
  }

  newBookmark.$inject = ['BookmarksService'];

  function newBookmark(BookmarksService) {
    return new BookmarksService();
  }
}());
