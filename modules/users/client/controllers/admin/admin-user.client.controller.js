'use strict';
angular.module('users.admin')
  .controller('AdminUserController', AdminUserController);
AdminUserController.$inject = ['$window', '$timeout', '$scope', '$state', 'Authentication', 'userResolve', 'AdminUserApi', 'Constants', 'FileUploader'];


function AdminUserController($window, $timeout, $scope, $state, Authentication, userResolve, AdminUserApi, Constants, FileUploader) {
  $scope.authentication = Authentication;
  $scope.user = userResolve;
  $scope.newPassword = '';

  // New and Edit screen
  $scope.save = isValid => {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'userForm');
      return false;
    }
    var user = $scope.user;
    if (user._id) {
      user.$update(successCb, errorCb);
    } else {
      user.$save(successCb, errorCb);
    }

    function successCb(res) {
      $state.reload();
    }
    function errorCb(err) {
      alert('Can\'t save user: ' + err.message);
    }
  };
  // Reset password
  $scope.update_pass = isValid => {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'userForm');
      return false;
    }
    AdminUserApi.reset_pass($scope.user._id, $scope.newPassword)
      .then(() => {
        alert('Reset password successfully');
      })
      .catch(err => {
        alert('Can\'t reset password: ' + err.message);
      });
  };
  $scope.remove = () => {
    if ($window.confirm('Delete this user?')) {
      $scope.user.$remove(function () {
        $state.go('admin.users.list');
      });
    }
  };
}
