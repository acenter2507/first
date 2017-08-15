'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication',
  function ($rootScope, $scope, Authentication) {
    $scope.page_notifs = '';
    $scope.page_title = $scope.page_notifs + 'Polls';

    $rootScope.$on('updateNotif', function (event, data) {
      if (date > 0) {
        $scope.page_notifs = '(' + data + ') ';
      } else {
        $scope.notifs = '';
      }
    });
  }
]);
