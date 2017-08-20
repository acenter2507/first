'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication', 'Notification',
  function ($rootScope, $scope, Authentication, Notification) {
    console.log('WebAppController');
    // User info
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user);
    $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');

    // Notificaton info
    if ($scope.isLogged) {
      $scope.notifCnt = Notification.notifCnt;
      $scope.notifications = Notification.notifications;
    }

    $scope.page_notifs = '';
    $scope.page_name = 'Polls';
    $scope.page_title = ($scope.notifCnt > 0) ? '(' + $scope.notifCnt + ')' : '' + $scope.page_name;

    $rootScope.$on('updateNotif', function (event, data) {
      if (data > 0) {
        $scope.page_notifs = '(' + data + ') ';
      } else {
        $scope.page_notifs = '';
      }
      $scope.page_title = $scope.page_notifs + $scope.page_name;
    });

    $scope.$watch('user', () => {
      console.log('WebAppController', 'User info updated');
      $scope.isLogged = ($scope.user);
      $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
      if ($scope.isLogged) {
        $scope.notifCnt = Notification.notifCnt;
        $scope.notifications = Notification.notifications;
      }
    });
  }
]);
