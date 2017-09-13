'use strict';

angular.module('users').controller('TwitterLoginController', TwitterLoginController);
TwitterLoginController.$inject = [
  '$scope',
  '$location',
  '$stateParams',
  'toastr',
  '$translate',
  '$state',
  '$http'
];
function TwitterLoginController(
  $scope,
  $location,
  $stateParams,
  toastr,
  $translate,
  $state,
  $http
) {
  if (!$stateParams.social) $location.path('/');
  $scope.credentials = { user: $stateParams.social };
  $scope.busy = false;
  get_translate();
  $scope.submit = function (isValid) {
    if ($scope.busy) return;
    $scope.busy = true;
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'mailForm');
      $scope.busy = false;
      return false;
    }

    $http.post('/api/auth/twitter', $scope.credentials).success(function (response) {
      Authentication.user = response;
      $scope.busy = false;
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }).error(function (response) {
      $scope.busy = false;
      show_error(response.message);
    });
  };
  function get_translate() {
    $translate('MS_CM_ERROR').then(tsl => { $scope.MS_CM_ERROR = tsl; });
    $translate('MS_CM_SUCCESS').then(tsl => { $scope.MS_CM_SUCCESS = tsl; });
  }

  function show_error(msg) {
    $translate(msg).then(tsl => {
      if (!tsl || tsl.length === 0) {
        toastr.error(msg, $scope.MS_CM_ERROR);
      } else {
        toastr.error(tsl, $scope.MS_CM_ERROR);
      }
    });
  }
}