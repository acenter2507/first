'use strict';

angular.module('core').controller('WebAppController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    // $scope.authentication = Authentication;
    $scope.title = 'xxxxxxxx';
  }
]);
