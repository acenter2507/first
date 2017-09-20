'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.busy = false;
    //If user is signed in then redirect back home
    if ($scope.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;
      if ($scope.busy) return;
      $scope.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');
        $scope.busy = false;
        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.busy = false;
        $scope.handleShowMessage(response.message, false);
      }).error(function (err) {
        // Show user error message and clear form
        $scope.busy = false;
        $scope.credentials = null;
        $scope.handleShowMessage(err.message, true);
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;
      if ($scope.busy) return;
      $scope.busy = true;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');
        $scope.busy = false;
        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        $scope.passwordDetails = null;
        $scope.busy = false;
        Authentication.user = response;
        $location.path('/password/reset/success');
      }).error(function (err) {
        $scope.busy = false;
        $scope.handleShowMessage(err.message, true);
      });
    };
  }
]);
