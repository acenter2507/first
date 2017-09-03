'use strict';

angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$state',
  '$http',
  '$location',
  '$window',
  'Authentication',
  'PasswordValidator',
  'toastr',
  'Constants',
  'vcRecaptchaService',
  '$translate',
  function (
    $scope,
    $state,
    $http,
    $location,
    $window,
    Authentication,
    PasswordValidator,
    toastr,
    Constants,
    vcRecaptchaService,
    $translate
  ) {
    // Get an eventual error defined in the URL query string:
    get_translate();
    $scope.error = $location.search().err;
    $scope.isShowForm = true;
    $scope.busy = false;
    // $scope.reCaptcha = Constants.reCaptcha;
    // $scope.response = null;
    // $scope.widgetId = null;
    // If user is signed in then redirect back home
    if (Authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      if ($scope.busy) return;
      $scope.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'signupForm');
        $scope.busy = false;
        return false;
      }
      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        $scope.busy = false;
        if (response.success) {
          $scope.isShowForm = false;
        }
      }).error(function (response) {
        $scope.busy = false;
        show_error(response.message);
      });
    };

    $scope.signin = function (isValid) {
      if ($scope.busy) return;
      $scope.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'signinForm');
        $scope.busy = false;
        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        Authentication.user = response;
        $scope.busy = false;
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.busy = false;
        show_error(response.message);
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }
      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };

    // $scope.setResponse = function (response) {
    //   // console.info('Response available');
    //   $scope.response = response;
    // };
    // $scope.setWidgetId = function (widgetId) {
    //   // console.info('Created widget ID: %s', widgetId);
    //   $scope.widgetId = widgetId;
    // };
    // $scope.cbExpiration = function () {
    //   console.info('Captcha expired. Resetting response object');
    //   vcRecaptchaService.reload($scope.widgetId);
    //   $scope.response = null;
    // };

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
  }
]);
