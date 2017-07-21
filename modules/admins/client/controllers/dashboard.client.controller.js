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
    $scope.total_users = 2500;
    $scope.total_polls = 4981;
    $scope.total_comments = 2500;
    $scope.total_visit = 24230;
  }
})();
