'use strict';

angular.module('users').controller('VerificationController', VerificationController);
VerificationController.$inject = [
  '$scope',
  '$location'
];
function VerificationController(
  $scope,
  $location
) {
  $scope.error = $location.search().err;
  $scope.message = '';
  if ($scope.error === 1 || $scope.error === '1') {
    $scope.message = 'MS_USERS_VERIFI_ERROR_1';
  }
  if ($scope.error === 2 || $scope.error === '2') {
    $scope.message = 'MS_USERS_BLOCK';
  }
  if ($scope.error === 3 || $scope.error === '3') {
    $scope.message = 'MS_USERS_VERIFI_ERROR_3';
  }
}