'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$scope',
  '$state',
  'Authentication',
  'CategorysService',
  'Action',
  '$stateParams',
  function ($scope, $state, Authentication, Categorys, Action, $stateParams) {
    $scope.detailToggle = -1;
    $scope.form = {};
    $scope.categorys = Categorys.query();

    $scope.condition = {};
    $scope.condition.key = $stateParams.key;
    $scope.condition.in = $stateParams.in;
    $scope.condition.status = $stateParams.status;
    $scope.condition.by = $stateParams.by;
    $scope.condition.ctgr = $stateParams.ctgr;

    $scope.condition.cmt = $stateParams.cmt;
    $scope.condition.compare = $stateParams.compare;

    $scope.condition.created = $stateParams.created;
    $scope.condition.timing = $stateParams.timing;

    $scope.condition.sort = $stateParams.sort;
    $scope.condition.sortkind = $stateParams.sortkind;

    $scope.search = () => {

    };

    $scope.busy = false;
    $scope.polls = [];
    function excute() {
      if (check_params()) {
        $scope.busy = true;
        Action.search($scope.condition)
          .then()
          .catch();
      }
    }

    function check_params() {
      if ($scope.key || $scope.status || $scope.by || $scope.ctgr || $scope.cmt || $scope.created) {
        return true;
      }
      return false;
    }
  }
]);
