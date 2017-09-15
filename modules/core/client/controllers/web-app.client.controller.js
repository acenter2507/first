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
    // Init
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
    // Init socket
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
    // Load categorys
    function initCategorys() {
      Categorys.load();
    }
    // Lấy message lưu trong storage
    getFlash();
    function getFlash() {
      var flash = Storages.get_session(Constants.storages.flash);
      if (flash) {
        $scope.show_success(flash);
        Storages.set_session(Constants.storages.flash, undefined);
      }
    }

    // Thay đổi ngôn ngữ
    $scope.change_language = lang => {
      $translate.use(lang);
      var tz = $window.locales[lang] || $window.locales.en;
      moment.tz.setDefault(tz);
      moment.locale(lang);
      amMoment.changeLocale(lang);
    };

    // Lấy thông tin translate cơ bản
    get_translate();
    function get_translate() {
      $translate('MS_CM_ERROR').then(tsl => { $scope.MS_CM_ERROR = tsl; });
      $translate('MS_CM_SUCCESS').then(tsl => { $scope.MS_CM_SUCCESS = tsl; });
    }

    // Hiển thị thông báo với param
    $scope.show_message_params = function (msg, params, error) {
      $translate(msg, params).then(tsl => {
        if (error) {
          toastr.error(tsl, $scope.MS_CM_ERROR);
        } else {
          toastr.success(tsl, $scope.MS_CM_SUCCESS);
        }
      });
    };
    // Hiển thị thông báo bình thường
    $scope.show_message = function (msg, error) {
      $translate(msg).then(tsl => {
        if (!tsl || tsl.length === 0) {
          if (error) {
            toastr.error(msg, $scope.MS_CM_ERROR);
          } else {
            toastr.error(msg, $scope.MS_CM_SUCCESS);
          }
        } else {
          if (error) {
            toastr.error(tsl, $scope.MS_CM_ERROR);
          } else {
            toastr.error(tsl, $scope.MS_CM_SUCCESS);
          }
        }
      });
    };
  }
]);
