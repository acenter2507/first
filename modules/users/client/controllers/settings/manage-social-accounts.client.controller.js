'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };
    $scope.hasUnConnectedAdditionalSocialAccounts = function (provider) {
      var cnt = 0;
      for (var i in $scope.user.additionalProvidersData) {
        cnt++;
      }
      if (cnt < 4) return true;
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (err) {
        $scope.handleShowMessage(err.message || err.data.message, true);
      });
    };
  }
]);
