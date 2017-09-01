'use strict';

angular.module('users').controller('AuthenticationController', [
  '$rootScope',
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
    $rootScope,
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
    // $scope.reCaptcha = Constants.reCaptcha;
    // $scope.response = null;
    // $scope.widgetId = null;
    // If user is signed in then redirect back home
    if (Authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'signupForm');
        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        Authentication.user = response;
        // Notifications.loadNotifs();
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        toastr.error(response.message, 'Error!');
      });
    };

    $scope.signin = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'signinForm');
        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        Authentication.user = response;
        // Notifications.loadNotifs();
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $tranlate('response.message').then(tsl => {
          if (!tsl || tsl.length === 0) {
            toastr.error(response.message, $scope.MS_CM_ERROR);
          } else {
            toastr.error(tsl, $scope.MS_CM_ERROR);
          }
        });
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
  }
]);
