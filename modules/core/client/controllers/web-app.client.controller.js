'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication',
  function ($rootScope, $scope, Authentication) {
    console.log('WebAppController');
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user);
    $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
  
    $scope.page_notifs = '';
    $scope.page_name = 'Polls';
    $scope.page_title = $scope.page_notifs + $scope.page_name;

    $rootScope.$on('updateNotif', function (event, data) {
      if (data > 0) {
        $scope.page_notifs = '(' + data + ') ';
      } else {
        $scope.page_notifs = '';
      }
      $scope.page_title = $scope.page_notifs + $scope.page_name;
    });
  }
]);
