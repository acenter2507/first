'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$scope',
  '$state',
  'Authentication',
  'CategorysService',
  '$stateParams',
  function ($scope, $state, Authentication, Categorys, $stateParams) {
    $scope.detailToggle = -1;
    $scope.form = {};
    $scope.categorys = Categorys.query();

    console.log('heheheheheh');
    $scope.key = $stateParams.key;
    $scope.in = $stateParams.in;
    $scope.status = $stateParams.status;
    $scope.by = $stateParams.by;
    $scope.ctgr = $stateParams.ctgr;
    $scope.cmt = $stateParams.cmt;
    $scope.compare = $stateParams.compare;
    $scope.created = $stateParams.created;
    $scope.timing = $stateParams.timing;
    $scope.sort = $stateParams.sort;
    $scope.sortkind = $stateParams.sortkind;

    $scope.search = () => {

    };
  }
]);
