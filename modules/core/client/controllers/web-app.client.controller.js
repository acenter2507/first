'use strict';

angular.module('core').controller('WebAppController', [
  '$rootScope',
  '$scope',
  'Authentication',
  'Notification',
  'Constants',
  'Storages',
  'Socket',
  'Activitys',
  function ($rootScope, $scope, Authentication, Notification, Constants, Storages, Socket, Activitys) {
    // User info
    $scope.Authentication = Authentication;
    init();
    $scope.page_name = 'Polls';
    $scope.page_title = ($scope.notifCnt > 0) ? '(' + $scope.notifCnt + ')' : '' + $scope.page_name;

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
        Notification.loadNotifs();
      }
    }
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.on('notifs', res => {
        Notification.loadNotifs();
      });
      Socket.on('activity', res => {
        console.log('Has activity');
        Activitys.add(res);
      });
      $scope.$on('$destroy', function () {
        Socket.removeListener('activity');
        Socket.removeListener('notifs');
      });
    }
    function initWatch() {
      // Watch notifications
      $scope.$watch(() => {
        return Activitys.list;
      }, () => {
        $scope.activitys = Activitys.list;
        console.log($scope.activitys);
      });
      // Watch notifCnt
      $scope.$watch(() => {
        return Notification.notifCnt;
      }, () => {
        $scope.notifCnt = Notification.notifCnt;
        $scope.page_title = ($scope.notifCnt > 0) ? '(' + $scope.notifCnt + ')' + $scope.page_name : '' + $scope.page_name;
      });
      // Watch notifications
      $scope.$watch(() => {
        return Notification.notifications;
      }, () => {
        $scope.notifications = Notification.notifications;
      });
    }
  }
]);
