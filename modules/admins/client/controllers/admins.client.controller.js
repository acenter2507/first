(function () {
  'use strict';
  angular
    .module('admin')
    .controller('AdminsController', AdminsController);

  AdminsController.$inject = [
    '$state',
    '$scope',
    'Authentication'
  ];

  function AdminsController(
    $state,
    $scope,
    Authentication
  ) {
    $scope.$state = $state;
  }
})();
