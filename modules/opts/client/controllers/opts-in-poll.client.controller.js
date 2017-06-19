(function() {
  'use strict';

  // Polls controller
  angular
    .module('opts')
    .controller('OptsInPollController', OptsInPollController);

  OptsInPollController.$inject = [
    '$scope',
    '$state'
  ];

  function OptsInPollController($scope, $state) {
    $scope.dynamic = 80;
    $scope.max = 100;
    console.log(vm.poll);
  }
}());
