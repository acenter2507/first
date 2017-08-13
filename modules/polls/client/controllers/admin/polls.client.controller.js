(function () {
  'use strict';
  // Polls controller
  angular.module('polls').controller('PollsController', PollsController);

  PollsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'pollResolve',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function PollsController(
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
