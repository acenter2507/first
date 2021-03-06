(function () {
  'use strict';
  // Polls controller
  angular.module('polls.admin').controller('AdminPollController', AdminPollController);

  AdminPollController.$inject = [
    '$scope',
    '$state',
    '$window',
    'pollResolve',
    'AdminPollsService',
    'Action'
  ];

  function AdminPollController(
    $scope,
    $state,
    $window,
    poll,
    AdminPollsService,
    Action
  ) {
    var vm = this;
    vm.poll = poll;

    get_admin_poll_report();
    function get_admin_poll_report() {
      AdminPollsService.get_admin_poll_report(vm.poll._id)
        .then(res => {
          vm.poll.followed = res.data.followed;
          vm.poll.bookmarked = res.data.bookmarked;
          vm.poll.reported = res.data.reported;
          vm.poll.cmts = res.data.cmts;
        })
        .catch(err => {
          alert(err.message);
        });
    }

    prepareShowingData();
    function prepareShowingData() {
    }
  }
})();
