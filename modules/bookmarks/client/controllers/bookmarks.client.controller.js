(function () {
  'use strict';

  // Bookmarks controller
  angular
    .module('bookmarks')
    .controller('BookmarksController', BookmarksController);

  BookmarksController.$inject = ['$scope', '$state', '$window', 'Authentication', 'bookmarkResolve'];

  function BookmarksController ($scope, $state, $window, Authentication, bookmark) {
    var vm = this;

    vm.authentication = Authentication;
    vm.bookmark = bookmark;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Bookmark
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.bookmark.$remove($state.go('bookmarks.list'));
      }
    }

    // Save Bookmark
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.bookmarkForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.bookmark._id) {
        vm.bookmark.$update(successCallback, errorCallback);
      } else {
        vm.bookmark.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('bookmarks.view', {
          bookmarkId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
