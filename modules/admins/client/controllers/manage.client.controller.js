(function () {
  'use strict';
  angular
    .module('admin')
    .controller('ManageController', ManageController);

  ManageController.$inject = [
    '$state',
    '$scope',
    'Authentication'
  ];

  function ManageController(
    $state,
    $scope,
    Authentication
  ) {
    // Code
  }
})();
