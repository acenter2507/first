'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication',
  function ($rootScope, $scope, Authentication) {
    $scope.page_title = 'Polls';

    $rootScope.$on('updateNotif', function (event, data) {
      if (data > 0) {
        $scope.page_title = '(' + data + ')' + $scope.page_title;
        console.log($scope.page_title);
      }
    });
  }
]);
