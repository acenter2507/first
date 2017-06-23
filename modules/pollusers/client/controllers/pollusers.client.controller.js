(function () {
  'use strict';

  // Pollusers controller
  angular
    .module('pollusers')
    .controller('PollusersController', PollusersController);

  PollusersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'polluserResolve'];

  function PollusersController ($scope, $state, $window, Authentication, polluser) {
    var vm = this;

    vm.authentication = Authentication;
    vm.polluser = polluser;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Polluser
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.polluser.$remove($state.go('pollusers.list'));
      }
    }

    // Save Polluser
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.polluserForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.polluser._id) {
        vm.polluser.$update(successCallback, errorCallback);
      } else {
        vm.polluser.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('pollusers.view', {
          polluserId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
