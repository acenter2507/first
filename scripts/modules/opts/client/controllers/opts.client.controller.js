(function () {
  'use strict';

  // Opts controller
  angular
    .module('opts')
    .controller('OptsController', OptsController);

  OptsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'optResolve'];

  function OptsController ($scope, $state, $window, Authentication, opt) {
    var vm = this;

    vm.authentication = Authentication;
    vm.opt = opt;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Opt
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.opt.$remove($state.go('opts.list'));
      }
    }

    // Save Opt
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.opt._id) {
        vm.opt.$update(successCallback, errorCallback);
      } else {
        vm.opt.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('opts.view', {
          optId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
