'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication',
  function ($rootScope, $scope, Authentication) {
    $scope.page_title = 'Polls';
    
    $rootScope.$on('updateNotif', notifs => {
      if (notifs > 0) {
        $scope.page_title = '(' + notifs + ')' + $scope.page_title;
      }
    });
  }
]);
