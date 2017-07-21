(function () {
  'use strict';
  angular
    .module('admin')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = [
    '$state',
    '$scope',
    'Authentication'
  ];

  function DashboardController(
    $state,
    $scope,
    Authentication
  ) {
    // Code
  }
})();
