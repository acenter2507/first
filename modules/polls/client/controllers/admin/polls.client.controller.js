(function () {
  'use strict';
  // Polls controller
  angular.module('polls').controller('AdminPollController', AdminPollController);

  AdminPollController.$inject = [
    '$scope',
    '$state',
    '$window',
    'pollResolve',
    'AdminPollsService',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function AdminPollController(
    $scope,
    $state,
    $window,
    poll,
    AdminPollsService,
    Action,
    toast,
    dialog
  ) {
    var vm = this;
    vm.poll = poll;

    get_admin_poll_report();
    function get_admin_poll_report() {
      AdminPollsService.get_admin_poll_report(vm.poll._id)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          console.log(err);
        });
    }
  }
})();
