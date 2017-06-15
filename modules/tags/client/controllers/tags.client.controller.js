(function () {
  'use strict';

  // Tags controller
  angular
    .module('tags')
    .controller('TagsController', TagsController);

  TagsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'tagResolve'];

  function TagsController ($scope, $state, $window, Authentication, tag) {
    var vm = this;

    vm.authentication = Authentication;
    vm.tag = tag;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Tag
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.tag.$remove($state.go('tags.list'));
      }
    }

    // Save Tag
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tagForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tag._id) {
        vm.tag.$update(successCallback, errorCallback);
      } else {
        vm.tag.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tags.view', {
          tagId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
