(function() {
  'use strict';

  // Polls controller
  angular
    .module('polls')
    .controller('PollsController', PollsController);

  PollsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'pollResolve'];

  function PollsController($scope, $state, $window, Authentication, poll) {
    var vm = this;

    const bk_poll = poll;
    vm.authentication = Authentication;
    vm.poll = poll;
    vm.close_min = new Date();
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.discard = discard;

    // Remove existing Poll
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove($state.go('polls.list'));
      }
    }

    // Save Poll
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }

      // TODO: move create/update logic to service
      console.log(vm.poll);
      if (vm.poll._id) {
        vm.poll.$update(successCallback, errorCallback);
      } else {
        vm.poll.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('polls.view', {
          pollId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    // Discard edit or add poll
    function discard() {
      if (angular.equals(vm.poll, bk_poll)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    }

    // Back to before screen
    function handle_discard() {
      if (vm.poll._id) {
        $state.go('polls.view', { pollId: vm.poll._id });
      } else {
        $state.go('polls.list');
      }
    }
  }
}());
