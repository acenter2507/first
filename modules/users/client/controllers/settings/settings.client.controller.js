'use strict';

angular.module('users').controller('SettingsController', [
  '$scope',
  'toastr',
  '$translate',
  function (
    $scope,
    toastr,
    $translate, ) {
    get_translate();
    function get_translate() {
      $translate('MS_CM_ERROR').then(tsl => { $scope.MS_CM_ERROR = tsl; });
      $translate('MS_CM_SUCCESS').then(tsl => { $scope.MS_CM_SUCCESS = tsl; });
    }

    $scope.show_error = msg => {
      $translate(msg).then(tsl => {
        if (!tsl || tsl.length === 0) {
          toastr.error(msg, $scope.MS_CM_ERROR);
        } else {
          toastr.error(tsl, $scope.MS_CM_ERROR);
        }
      });
    };
    $scope.show_success = msg => {
      $translate(msg).then(tsl => {
        if (!tsl || tsl.length === 0) {
          toastr.success(msg, $scope.MS_CM_ERROR);
        } else {
          toastr.success(tsl, $scope.MS_CM_ERROR);
        }
      });
    };
  }
]);
