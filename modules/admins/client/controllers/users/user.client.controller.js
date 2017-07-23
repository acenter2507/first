'use strict';
angular.module('admin')
  .controller('UserListController', UserController);
UserController.$inject = ['$window', '$scope', '$state', 'Authentication', 'userResolve', 'AdminApi', 'Constants', 'FileUploader', 'toastr', 'ngDialog'];


function UserController($window, $scope, $state, Authentication, userResolve, AdminApi, Constants, FileUploader, toast, dialog) {
  $scope.authentication = Authentication;
  $scope.user = userResolve;

  $scope.imageURL = $scope.user.profileImageURL || Constants.defaultProfileImageURL;
  $scope.uploader = new FileUploader({
    url: 'api/users/picture',
    alias: 'newProfilePicture'
  });
  // Called after the user selected a new picture file
  $scope.uploader.onAfterAddingFile = function (fileItem) {
    if ($window.FileReader) {
      var fileReader = new FileReader();
      fileReader.readAsDataURL(fileItem._file);

      fileReader.onload = function (fileReaderEvent) {
        $timeout(function () {
          $scope.imageURL = fileReaderEvent.target.result;
        }, 0);
      };
    }
  };


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
      toast.error('Can\'t save user: ' + err.message, 'Error!');
    }
  };
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

  // $scope.update = function (isValid) {
  //   if (!isValid) {
  //     $scope.$broadcast('show-errors-check-validity', 'userForm');

  //     return false;
  //   }

  //   var user = $scope.user;

  //   user.$update(function () {
  //     $state.go('admin.user', {
  //       userId: user._id
  //     });
  //   }, function (errorResponse) {
  //     $scope.error = errorResponse.data.message;
  //   });
  // };
}
