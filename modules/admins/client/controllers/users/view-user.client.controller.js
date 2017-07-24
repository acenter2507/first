'use strict';
angular.module('admin')
  .controller('ViewUserController', ViewUserController);
ViewUserController.$inject = ['$window', '$timeout', '$scope', '$state', 'Authentication', 'userResolve', 'AdminApi', 'Constants', 'FileUploader', 'toastr', 'ngDialog'];


function ViewUserController($window, $timeout, $scope, $state, Authentication, userResolve, AdminApi, Constants, FileUploader, toast, dialog) {
  $scope.authentication = Authentication;
  $scope.user = userResolve;

  

  $scope.remove = function (user) {
    if (confirm('Are you sure you want to delete this user?')) {
      if (user) {
        user.$remove();

        $scope.users.splice($scope.users.indexOf(user), 1);
      } else {
        $scope.user.$remove(function () {
          $state.go('admin.users.list');
        });
      }
    }
  };
}
