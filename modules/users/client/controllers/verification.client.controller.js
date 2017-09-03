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
  if (error === 1 || error === '1') {
    $scope.message = 'MS_USERS_VERIFI_ERROR_1';
  }
  if (error === 2 || error === '2') {
    $scope.message = 'MS_USERS_BLOCK';
  }
  if (error === 3 || error === '3') {
    $scope.message = 'MS_USERS_VERIFI_ERROR_3';
  }
}