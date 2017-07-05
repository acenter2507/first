(function () {
  'use strict';

  // Views controller
  angular
    .module('views')
    .controller('ViewsController', ViewsController);

  ViewsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'viewResolve'];

  function ViewsController ($scope, $state, $window, Authentication, view) {
    var vm = this;

    vm.authentication = Authentication;
    vm.view = view;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing View
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.view.$remove($state.go('views.list'));
      }
    }

    // Save View
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.viewForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.view._id) {
        vm.view.$update(successCallback, errorCallback);
      } else {
        vm.view.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('views.view', {
          viewId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
