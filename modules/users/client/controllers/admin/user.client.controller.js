'use strict';
angular.module('admin')
  .controller('UserController', UserController);
UserController.$inject = ['$window', '$timeout', '$scope', '$state', 'Authentication', 'userResolve', 'AdminApi', 'Constants', 'FileUploader'];


function UserController($window, $timeout, $scope, $state, Authentication, userResolve, AdminApi, Constants, FileUploader) {
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
    AdminApi.reset_pass($scope.user._id, $scope.newPassword)
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



  // $scope.imageURL = $scope.user.profileImageURL || Constants.defaultProfileImageURL;
  // $scope.uploader = new FileUploader({
  //   url: '',
  //   alias: 'profilePicture'
  // });
  // // Called after the user selected a new picture file
  // $scope.uploader.onAfterAddingFile = function (fileItem) {
  //   $scope.uploader.queue.splice(0, $scope.uploader.queue.length - 1);
  //   if ($window.FileReader) {
  //     var fileReader = new FileReader();
  //     fileReader.readAsDataURL(fileItem._file);

  //     fileReader.onload = function (fileReaderEvent) {
  //       $timeout(function () {
  //         $scope.imageURL = fileReaderEvent.target.result;
  //       }, 0);
  //     };
  //   }
  // };
  // // Change user profile picture
  // $scope.uploadProfilePicture = function () {
  //   // Clear messages
  //   $scope.success = $scope.error = null;
  //   // Start upload
  //   $scope.uploader.uploadAll();
  // };
  // // Called after the user has successfully uploaded a new picture
  // $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
  //   // Show success message
  //   $state.reload();
  // };

  // // Called after the user has failed to uploaded a new picture
  // $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
  //   // Show error message
  //   $scope.error = response.message;
  // };