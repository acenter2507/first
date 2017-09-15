'use strict';

angular.module('users')
  .controller('EditProfileController', EditProfileController);

EditProfileController.$inject = [
  '$scope',
  '$timeout',
  '$window',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'FileUploader',
  'ngDialog',
  'Storages',
  'Constants'];
function EditProfileController(
  $scope,
  $timeout,
  $window,
  $http,
  $location,
  Users,
  Authentication,
  FileUploader,
  dialog,
  Storages,
  Constants
) {
  $scope.imageURL = $scope.user.profileImageURL;
  $scope.imageURLEdited = {};
  $scope.profile_busy = false;
  $scope.picture_busy = false;
  $scope.userInfo = _.pick($scope.user, '_id', 'displayName', 'email');
  // Update a user profile
  $scope.updateUserProfile = function (isValid) {
    if ($scope.profile_busy) return;
    $scope.profile_busy = true;
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'userForm');
      $scope.profile_busy = false;
      return false;
    }
    if (_.isEqual($scope.userInfo, _.pick($scope.user, '_id', 'displayName', 'email'))) {
      $scope.profile_busy = false;
      return false;
    }
    if ($scope.userInfo.email !== $scope.user.email) {
      $scope.message_title = 'LB_USER_EMAIL_CONFIRM';
      $scope.message_content = 'LB_USER_EMAIL_CONFIRM_CONTENT';
      $scope.dialog_type = 1;
      $scope.buton_label = 'LB_SAVE';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        return handle_save();
      }, reject => {
        $scope.userInfo.email = $scope.user.email;
        $scope.profile_busy = false;
      });
    } else {
      return handle_save();
    }
    function handle_save() {
      var user = new Users($scope.userInfo);

      user.$update(function (res) {
        $scope.$broadcast('show-errors-reset', 'userForm');
        $scope.profile_busy = false;
        // Trường hợp trả về user
        if (res._id) {
          Authentication.user = res;
          $scope.show_message('LB_PROFILE_SUCCESE', false);
        } else {
          Storages.set_session(Constants.storages.flash, res.message);
          $window.location.href = res.host + '/api/auth/signout';
        }
      }, function (err) {
        $scope.profile_busy = false;
        $scope.userInfo = _.pick($scope.user, '_id', 'displayName', 'email');
        $scope.show_message(err.message, true);
      });
    }
  };

  $scope.uploader = new FileUploader({
    url: 'api/users/picture',
    alias: 'newProfilePicture'
  });
  $scope.uploader.filters.push({
    name: 'imageFilter',
    fn: function (item, options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
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
  // Called after the user has successfully uploaded a new picture
  $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
    // Populate user object
    $scope.user = Authentication.user = response;
    // Clear upload buttons
    $scope.cancelUpload();
  };
  // Called after the user has failed to uploaded a new picture
  $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
    // Clear upload buttons
    $scope.cancelUpload();
  };
  // Change user profile picture
  $scope.uploadProfilePicture = function () {
    // Start upload
    // $scope.uploader.uploadAll();
    showDropImage();
    function showDropImage() {
      var mDialog = dialog.open({
        template: 'modules/core/client/views/templates/drop-image.dialog.template.html',
        scope: $scope,
        appendClassName: 'images-upload-dialog'
      });
      mDialog.closePromise.then(function (data) {
        if (!data.value) return;
        var blob = dataURItoBlob(data.value);
        $scope.uploader.queue[0]._file = blob;
        $scope.uploader.uploadAll();
      });
    }
  };
  // Cancel the upload process
  $scope.cancelUpload = function () {
    $scope.uploader.clearQueue();
    $scope.imageURL = $scope.user.profileImageURL;
  };
  function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mimeString });
  }
}
