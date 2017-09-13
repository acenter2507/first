'use strict';

angular.module('core').controller('WebAppController', [
  '$rootScope',
  '$scope',
  'Authentication',
  'Notifications',
  'Socket',
  'Categorys',
  '$translate',
  'amMoment',
  '$window',
  'Storages',
  'Constants',
  'toastr',
  function ($rootScope, $scope, Authentication, Notifications, Socket, Categorys, $translate, amMoment, $window, Storages, Constants, toastr) {
    // User info
    $scope.Authentication = Authentication;
    $scope.Notifications = Notifications;
    $scope.Categorys = Categorys;

    $scope.page_name = 'Polls';
    $scope.page_title = ($scope.Notifications.notifCnt > 0) ? ('(' + $scope.Notifications.notifCnt + ') ' + $scope.page_name) : ('' + $scope.page_name);

    // Watch user info
    $scope.$watch('Authentication.user', () => {
      init();
    });
    $scope.$watch('Notifications.notifCnt', () => {
      $scope.page_title = ($scope.Notifications.notifCnt > 0) ? ('(' + $scope.Notifications.notifCnt + ') ' + $scope.page_name) : ('' + $scope.page_name);
    });
    function init() {
      $scope.user = Authentication.user;
      $scope.isLogged = ($scope.user);
      $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
      if ($scope.isLogged) {
        initSocket();
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
      $scope.$on('$destroy', function () {
        Socket.removeListener('notifs');
      });
    }
    function initCategorys() {
      Categorys.load();
    }
    getFlash();
    function getFlash() {
      var flash = Storages.get_session(Constants.storages.flash);
      if (flash) {
        $translate(flash).then(tsl => { toastr.success(tsl, ''});
        Storages.set_session(Constants.storages.flash, undefined);
      }
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
