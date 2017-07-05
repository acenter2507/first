(function () {
  'use strict';

  // Pollreports controller
  angular
    .module('pollreports')
    .controller('PollreportsController', PollreportsController);

  PollreportsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'pollreportResolve'];

  function PollreportsController ($scope, $state, $window, Authentication, pollreport) {
    var vm = this;

    vm.authentication = Authentication;
    vm.pollreport = pollreport;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Pollreport
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.pollreport.$remove($state.go('pollreports.list'));
      }
    }

    // Save Pollreport
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollreportForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.pollreport._id) {
        vm.pollreport.$update(successCallback, errorCallback);
      } else {
        vm.pollreport.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('pollreports.view', {
          pollreportId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
