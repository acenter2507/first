'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator', 'toastr', '$translate',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator, toastr, $translate) {
    $scope.authentication = Authentication;
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
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.busy = false;
        $scope.credentials = null;
        $scope.show_error(response.message);
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
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        $scope.busy = false;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.busy = false;
        $scope.show_error(response.message);
      });
    };
  }
]);
