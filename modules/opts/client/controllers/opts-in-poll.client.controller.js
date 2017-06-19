(function() {
  'use strict';

  // Polls controller
  angular
    .module('opts')
    .controller('OptsInPollController', OptsInPollController);

  OptsInPollController.$inject = [
    '$scope',
    '$state'
    // '$window',
    // 'Authentication',
    // 'pollResolve',
    // 'PollsApi',
    // 'TagsService',
    // '$aside',
    // 'CmtsService',
    // '$dropdown'
  ];

  function OptsInPollController($scope, $state) {
    $scope.dynamic = 80;
    $scope.max = 100;
  }
}());
