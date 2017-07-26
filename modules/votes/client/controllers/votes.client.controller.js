(function() {
  'use strict';

  // Votes controller
  angular
    .module('votes')
    .controller('VotesController', VotesController);

  VotesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'voteResolve', 'PollsService'];

  function VotesController($scope, $state, $window, Authentication, vote, Polls) {
    var vm = this;

    vm.authentication = Authentication;
    vm.vote = vote;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.polls = Polls.query();
    vm.selectPoll = selectPoll;
    vm.opts = [];
    vm.selectedOpts = [];
    // Remove existing Vote
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.vote.$remove($state.go('votes.list'));
      }
    }

    // Save Vote
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.voteForm');
        return false;
      }
      vm.vote.opts = vm.selectedOpts;
      // TODO: move create/update logic to service
      if (vm.vote._id) {
        vm.vote.$update(successCallback, errorCallback);
      } else {
        vm.vote.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('votes.view', {
          voteId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

  }
}());
