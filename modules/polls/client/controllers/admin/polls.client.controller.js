(function () {
  'use strict';
  // Polls controller
  angular.module('polls').controller('AdminPollController', AdminPollController);

  AdminPollController.$inject = [
    '$scope',
    '$state',
    '$window',
    'pollResolve',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function AdminPollController(
    $scope,
    $state,
    $window,
    poll,
    Action,
    toast,
    dialog
  ) {
    var vm = this;
    vm.poll = poll;
  }
})();
