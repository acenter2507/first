'use strict';

angular.module('core').controller('WebAppController', [
  '$rootScope',
  '$scope',
  'Authentication',
  'Notification',
  'Constants',
  'Storages',
  'Socket',
  function ($rootScope, $scope, Authentication, Notification, Constants, Storages, Socket) {
    // User info
    $scope.Authentication = Authentication;
    $scope.Notification = Notification;
    loadUser();
    if ($scope.isLogged) {
      initSocket();
      Notification.loadNotifs();
    }
    $scope.page_name = 'Polls';
    $scope.page_title = ($scope.notifCnt > 0) ? '(' + $scope.notifCnt + ')' : '' + $scope.page_name;

    // Watch user info
    $scope.$watch('Authentication.user', () => {
      loadUser();
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
    function loadUser() {
      $scope.user = Authentication.user;
      $scope.isLogged = ($scope.user);
      $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
    }
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.on('notifs', res => {
        Notification.loadNotifs();
      });
      Socket.on('activity', res => {
        res.time = moment().format();
        let activitys = JSON.parse(Storages.get_session(Constants.storages.activitys, JSON.stringify([])));
        activitys.push(res);
        Storages.set_session(Constants.storages.activitys, JSON.stringify(activitys));
        $rootScope.$emit('activity');
      });
      $scope.$on('$destroy', function () {
        Socket.removeListener('activity');
        Socket.removeListener('notifs');
      });
    }
  }
]);
