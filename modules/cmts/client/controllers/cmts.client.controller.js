(function () {
  'use strict';

  // Cmts controller
  angular
    .module('cmts')
    .controller('CmtsController', CmtsController);

  CmtsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'cmtResolve', 'PollsService'];

  function CmtsController ($scope, $state, $window, Authentication, cmt, Polls) {
    var vm = this;

    vm.authentication = Authentication;
    vm.cmt = cmt;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.polls = Polls.query();

    // Remove existing Cmt
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.cmt.$remove($state.go('cmts.list'));
      }
    }

    // Save Cmt
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cmtForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.cmt._id) {
        vm.cmt.$update(successCallback, errorCallback);
      } else {
        vm.cmt.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('cmts.view', {
          cmtId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
