'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$scope',
  '$state',
  'Authentication',
  '$stateParams',
  function ($scope, $state, Authentication, $stateParams) {
    $scope.detailToggle = -1;
    $scope.form = {};

    console.log('heheheheheh');
    $scope.key = $stateParams.key;
    $scope.in = $stateParams.in;
    $scope.by = $stateParams.by;
    $scope.category = $stateParams.category;
    $scope.cmt = $stateParams.cmt;
    $scope.compare = $stateParams.compare;
    $scope.created = $stateParams.created;
    $scope.sort = $stateParams.sort;
    $scope.sortkind = $stateParams.sortkind;

    $scope.search = () => {

    };
  }
]);
