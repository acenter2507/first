(function() {
  'use strict';

  // Opts controller
  angular
    .module('opts')
    .controller('OptsController', OptsController);

  OptsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'optResolve', 'PollsService', 'OptsUtil'];

  function OptsController($scope, $state, $window, Authentication, opt, Polls, Utils) {
    var vm = this;

    vm.authentication = Authentication;
    vm.opt = opt;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.polls = Polls.query();
    vm.poll_change = poll_change;

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

      vm.opt.poll = Utils.get_poll_by_id(vm.polls, vm.opt.poll);
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

    // Poll selection change
    function poll_change() {

    }
  }
}());
