(function () {
  'use strict';

  angular
    .module('bookmarks')
    .controller('BookmarksListController', BookmarksListController);

  BookmarksListController.$inject = ['BookmarksService'];

  function BookmarksListController(BookmarksService) {
    var vm = this;

    vm.bookmarks = BookmarksService.query();
  }
}());
