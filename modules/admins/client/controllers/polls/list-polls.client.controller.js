(function () {
  'use strict';
  angular
    .module('admin')
    .controller('PollListController', PollListController);

  PollListController.$inject = [
    '$state',
    '$scope',
    'Authentication'
  ];

  function PollListController(
    $state,
    $scope,
    Authentication
  ) {
  }
})();
