'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.password_busy = false;
    // Change user password
    $scope.changeUserPassword = function (isValid) {
      if ($scope.password_busy) return;
      $scope.password_busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');
        $scope.password_busy = false;
        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.passwordDetails = null;
        $scope.password_busy = false;
        $scope.show_success(response.message);
      }).error(function (response) {
        $scope.show_error(response.message);
        $scope.password_busy = false;
      });
    };
  }
]);
