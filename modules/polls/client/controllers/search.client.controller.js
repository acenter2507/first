'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$scope',
  '$state',
  'Authentication',
  'CategorysService',
  'Action',
  '$stateParams',
  'Storages',
  'Constants',
  function ($scope, $state, Authentication, Categorys, Action, $stateParams, Storages, Constants) {
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
      $state.go('search', $scope.condition);
    };

    $scope.busy = false;
    $scope.polls = [];
    excute();
    function excute() {
      if (check_params()) {
        $scope.busy = true;
        Action.search($scope.condition)
          .then(res => {
            console.log(res);
            $scope.busy = false;
          })
          .catch(err => {
            $scope.busy = false;
          });
      } else {
        $scope.condition = JSON.parse(Storages.get_local(Constants.storages.preferences, JSON.stringify({})));
      }
    }
    function check_params() {
      if ($scope.condition.key || $scope.condition.status || $scope.condition.by || $scope.condition.ctgr || $scope.condition.cmt || $scope.condition.created) {
        return true;
      }
      return false;
    }

    $scope.clear_preferences = () => {
      $scope.condition = {};
    };
    $scope.save_preferences = () => {
      Storages.set_local(Constants.storages.preferences, JSON.stringify($scope.condition));
    };
  }
]);
