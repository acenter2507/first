(function () {
  'use strict';

  // Voteopts controller
  angular
    .module('voteopts')
    .controller('VoteoptsController', VoteoptsController);

  VoteoptsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'voteoptResolve'];

  function VoteoptsController ($scope, $state, $window, Authentication, voteopt) {
    var vm = this;

    vm.authentication = Authentication;
    vm.voteopt = voteopt;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Voteopt
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.voteopt.$remove($state.go('voteopts.list'));
      }
    }

    // Save Voteopt
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.voteoptForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.voteopt._id) {
        vm.voteopt.$update(successCallback, errorCallback);
      } else {
        vm.voteopt.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('voteopts.view', {
          voteoptId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
