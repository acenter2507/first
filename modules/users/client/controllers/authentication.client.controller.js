'use strict';

angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$state',
  '$http',
  '$location',
  '$window',
  'Authentication',
  'PasswordValidator',
  'ngDialog',
  'Constants',
  'vcRecaptchaService',
  function (
    $scope,
    $state,
    $http,
    $location,
    $window,
    Authentication,
    PasswordValidator,
    dialog,
    Constants,
    vcRecaptchaService
  ) {
    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;
    if ($scope.error && $scope.error !== '') {
      $scope.show_message($scope.error, true);
    }
    $scope.isShowForm = true;
    $scope.busy = false;
    $scope.resend_busy = false;

    $scope.reCaptcha = Constants.reCaptcha;
    $scope.response = null;
    $scope.widgetId = null;
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
      }).error(function (err) {
        $scope.busy = false;
        $scope.show_message(err.message, true);
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
      }).error(function (err) {
        $scope.busy = false;
        $scope.show_message(err.message, true);
      });
    };
    $scope.resend = function () {
      if ($scope.resend_busy) return;
      $scope.resend_busy = true;
      $http.post('/api/auth/resend', { email: $scope.credentials.email }).success(function (response) {
        $scope.resend_busy = false;
        if (response.success) {
          $scope.isShowForm = false;
        }
      }).error(function (err) {
        $scope.resend_busy = false;
        $scope.show_message(err.message, true);
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }
      $window.location.href = url;
    };

    $scope.setResponse = function (response) {
      // console.info('Response available');
      $scope.response = response;
    };
    $scope.setWidgetId = function (widgetId) {
      // console.info('Created widget ID: %s', widgetId);
      $scope.widgetId = widgetId;
    };
    $scope.cbExpiration = function () {
      vcRecaptchaService.reload($scope.widgetId);
      $scope.response = null;
    };
  }
]);
