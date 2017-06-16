(function () {
  'use strict';

  // Polltags controller
  angular
    .module('polltags')
    .controller('PolltagsController', PolltagsController);

  PolltagsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'polltagResolve', 'PollsService', 'TagsService'];

  function PolltagsController ($scope, $state, $window, Authentication, polltag, Polls, Tags) {
    var vm = this;

    $scope.polls = Polls.query();
    $scope.tags = Tags.query();
    vm.authentication = Authentication;
    vm.polltag = polltag;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Polltag
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.polltag.$remove($state.go('polltags.list'));
      }
    }

    // Save Polltag
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.polltagForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.polltag._id) {
        vm.polltag.$update(successCallback, errorCallback);
      } else {
        vm.polltag.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('polltags.view', {
          polltagId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
