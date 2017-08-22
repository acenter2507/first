'use strict';

angular.module('core').controller('WebAppController', [
  '$rootScope',
  '$scope',
  'Authentication',
  'Notifications',
  'Constants',
  'Storages',
  'Socket',
  'Activitys',
  function ($rootScope, $scope, Authentication, Notifications, Constants, Storages, Socket, Activitys) {
    // User info
    $scope.Authentication = Authentication;
    $scope.Activitys = Activitys;
    $scope.Notifications = Notifications;

    $scope.page_name = 'Polls';
    $scope.page_title = ($scope.Notifications.notifCnt > 0) ? '(' + $scope.Notifications.notifCnt + ')' + $scope.page_name : '' + $scope.page_name;

    // Watch user info
    $scope.$watch('Authentication.user', () => {
      init();
    });
    function init() {
      $scope.user = Authentication.user;
      $scope.isLogged = ($scope.user);
      $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
      if ($scope.isLogged) {
        initSocket();
        initWatch();
        Notifications.loadNotifs();
      }
    }
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.on('notifs', res => {
        Notifications.loadNotifs();
      });
      Socket.on('activity', res => {
        $scope.Activitys.add(res);
      });
      $scope.$on('$destroy', function () {
        Socket.removeListener('activity');
        Socket.removeListener('notifs');
      });
    }
    // function initWatch() {
    //   // Watch notifCnt
    //   $scope.$watch(() => {
    //     return Notification.notifCnt;
    //   }, () => {
    //     $scope.notifCnt = Notification.notifCnt;
    //     $scope.page_title = ($scope.notifCnt > 0) ? '(' + $scope.notifCnt + ')' + $scope.page_name : '' + $scope.page_name;
    //   });
    //   // Watch notifications
    //   $scope.$watch(() => {
    //     return Notification.notifications;
    //   }, () => {
    //     $scope.notifications = Notification.notifications;
    //   });
    // }
  }
]);
