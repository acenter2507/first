'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication',
  function ($rootScope, $scope, Authentication) {
    $scope.page_notifs = '';
    $scope.page_name = 'Polls';
    $scope.page_title = $scope.page_notifs + $scope.page_name;

    $rootScope.$on('updateNotif', function (event, data) {
      console.log(data);
      if (data > 0) {
        $scope.page_notifs = '(' + data + ') ';
      } else {
        $scope.notifs = '';
      }
      $scope.page_title = $scope.page_notifs + $scope.page_name;
    });
  }
]);
