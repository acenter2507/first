'use strict';

angular.module('core').controller('WebAppController', [
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
  '$http',
  'ngDialog',
  function ($scope, Authentication, Notifications, Socket, Categorys, $translate, amMoment, $window, Storages, Constants, toastr, $http, dialog) {
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
      // Kiểm tra thông tin user mới có thay đổi ngôn ngữ hay không
      if ($scope.user.language !== $translate.use()) {
        $translate.use($scope.user.language);
        var tz = $window.locales[$scope.user.language];
        moment.tz.setDefault(tz);
        moment.locale($scope.user.language);
        amMoment.changeLocale($scope.user.language);
      }
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
      if (lang === $translate.use()) return;
      $translate('MS_USERS_LANG_CONFIRM').then(tsl => {
        var content = tsl;
        $translate(lang).then(_tsl => {
          content += _tsl;
          show_config(content);
        });
      });
      function show_config(content) {
        $scope.message_content = content;
        $scope.dialog_type = 1;
        $scope.buton_label = 'LB_CHANGE';
        dialog.openConfirm({
          scope: $scope,
          templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
        }).then(confirm => {
          handle_change_language();
        }, reject => {
        });
      }
      function handle_change_language() {
        delete $scope.message_title;
        delete $scope.message_content;
        delete $scope.dialog_type;
        delete $scope.buton_label;
        $http.post('/api/users/language', { language: lang }).success(function (response) {
          Authentication.user = response;
        }).error(function (err) {
          $scope.show_message(err.message, true);
        });
      }
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
