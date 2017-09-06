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
  'Categorys',
  '$translate',
  'amMoment',
  '$window',
  function ($rootScope, $scope, Authentication, Notifications, Constants, Storages, Socket, Activitys, Categorys, $translate, amMoment, $window) {
    // User info
    $scope.Authentication = Authentication;
    $scope.Activitys = Activitys;
    $scope.Notifications = Notifications;
    $scope.Categorys = Categorys;

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
        initActivitys();
        Notifications.loadNotifs();
      }
      initCategorys();
    }
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.on('notifs', () => {
        Notifications.loadNotifs();
      });
      // Socket.on('activity', res => {
      //   res.time = moment().format();
      //   $scope.Activitys.add(res);
      //   Storages.set_session(Constants.storages.activitys, JSON.stringify($scope.Activitys.list));
      // });
      $scope.$on('$destroy', function () {
        Socket.removeListener('activity');
        Socket.removeListener('notifs');
      });
    }
    function initActivitys() {
      if (Storages.has_session(Constants.storages.activitys)) {
        var activitys = JSON.parse(Storages.get_session(Constants.storages.activitys, JSON.stringify([])));
        activitys.forEach(function(element) {
          $scope.Activitys.add(element);
        });
      }
    }
    function initCategorys() {
      Categorys.load();
    }

    $scope.change_language = lang => {
      $translate.use(lang);
      var tz = $window.locales[lang] || $window.locales.en;
      moment.tz.setDefault(tz);
      moment.locale(lang);
      amMoment.changeLocale(lang);
    };
  }
]);
