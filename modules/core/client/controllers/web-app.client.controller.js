'use strict';

angular.module('core').controller('WebAppController', ['$rootScope', '$scope', 'Authentication', 'Notification',
  function ($rootScope, $scope, Authentication, Notification) {
    console.log('WebAppController');
    // User info
    $scope.Authentication = Authentication;
    $scope.Notification = Notification;
    loadUser();
    if ($scope.isLogged) {
      $scope.notifCnt = Notification.notifCnt;
      $scope.notifications = Notification.notifications;
    }

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

    // Watch user info
    $scope.$watch('Authentication.user', () => {
      loadUser();
    });
    // Watch notifCnt
    $scope.$watch('Notification.getNotifCnt', () => {
      $scope.notifCnt = Notification.notifCnt;
    });
    // Watch notifications
    $scope.$watch('Notification.getNotifications', () => {
      $scope.notifications = Notification.notifications;
    });
    function loadUser() {
      $scope.user = Authentication.user;
      $scope.isLogged = ($scope.user);
      $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
    }
  }
]);
