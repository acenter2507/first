'use strict';

angular.module('users')
.controller('EditProfileController', ['$scope', '$timeout', '$window', '$http', '$location', 'Users', 'Authentication', 'FileUploader', 'toastr', '$translate', 'ngDialog',
  function ($scope, $timeout, $window, $http, $location, Users, Authentication, FileUploader, toastr, $translate, dialog) {
    $scope.imageURL = $scope.user.profileImageURL;
    $scope.profile_busy = false;
    $scope.password_busy = false;
    $scope.picture_busy = false;
    $scope.userInfo = _.pick($scope.user, '_id', 'displayName', 'email');
    get_translate();
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if ($scope.profile_busy) return;
      $scope.profile_busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
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
        });
      } else {
        return handle_save();
      }
      function handle_save() {
        var user = new Users($scope.userInfo);

        user.$update(function (res) {
          $scope.$broadcast('show-errors-reset', 'userForm');
          Authentication.user = res;
          $scope.profile_busy = false;
          // show_success(res.message);
        }, function (err) {
          show_error(err.message);
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
      $scope.uploader.uploadAll();
    };
    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
    function get_translate() {
      $translate('MS_CM_ERROR').then(tsl => { $scope.MS_CM_ERROR = tsl; });
      $translate('MS_CM_SUCCESS').then(tsl => { $scope.MS_CM_SUCCESS = tsl; });
    }

    function show_error(msg) {
      $translate(msg).then(tsl => {
        if (!tsl || tsl.length === 0) {
          toastr.error(msg, $scope.MS_CM_ERROR);
        } else {
          toastr.error(tsl, $scope.MS_CM_ERROR);
        }
      });
    }
    function show_success(msg) {
      $translate(msg).then(tsl => {
        if (!tsl || tsl.length === 0) {
          toastr.success(msg, $scope.MS_CM_ERROR);
        } else {
          toastr.success(tsl, $scope.MS_CM_ERROR);
        }
      });
    }
  }
]);
