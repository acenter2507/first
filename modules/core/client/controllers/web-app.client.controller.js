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

    $scope.page_name = 'Blablaer';
    $scope.page_title = ($scope.Notifications.notifCnt > 0) ? ('(' + $scope.Notifications.notifCnt + ') ' + $scope.page_name) : ('' + $scope.page_name);

    // Watch user info
    $scope.$watch('Authentication.user', () => {
      onCreate();
    });
    $scope.$watch('Notifications.notifCnt', () => {
      $scope.page_title = ($scope.Notifications.notifCnt > 0) ? ('(' + $scope.Notifications.notifCnt + ') ' + $scope.page_name) : ('' + $scope.page_name);
    });
    // Init
    function onCreate() {
      $scope.user = Authentication.user;
      $scope.isLogged = ($scope.user);
      $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
      if ($scope.isLogged) {
        prepareSocketListener();
        Notifications.loadNotifs();
      }
      prepareCategorys();
      // Kiểm tra thông tin user mới có thay đổi ngôn ngữ hay không
      if ($scope.user.language !== $translate.use()) {
        $translate.use($scope.user.language);
        $scope.$broadcast('changeLanguage');
      }
    }
    // Init socket
    function prepareSocketListener() {
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
    function prepareCategorys() {
      Categorys.load();
    }
    // Lấy message lưu trong storage
    prepareFlashMessage();
    function prepareFlashMessage() {
      var message = Storages.get_session(Constants.storages.flash);
      if (message) {
        $scope.handleShowMessage(message, true);
        Storages.set_session(Constants.storages.flash, undefined);
      }
    }
    // Lấy thông tin translate cơ bản
    prepareCommonMessage();
    function prepareCommonMessage() {
      $translate(['MS_CM_ERROR', 'MS_CM_SUCCESS']).then(tsl => {
        $scope.MS_CM_ERROR = tsl.MS_CM_ERROR;
        $scope.MS_CM_SUCCESS = tsl.MS_CM_SUCCESS;

      });
    }

    // Thay đổi ngôn ngữ
    $scope.handleChangeLanguage = lang => {
      if (lang === $translate.use()) return;
      $translate(['MS_USERS_LANG_CONFIRM', lang]).then(tsl => {
        var content = tsl.MS_USERS_LANG_CONFIRM + tsl[lang];
        $scope.handleShowConfirm({
          content: content,
          type: 1,
          button: 'LB_CHANGE'
        }, confirm => {
          handleSaveLanguage();
        });
      });
      function handleSaveLanguage() {
        if ($scope.isLogged) {
          $http.post('/api/users/language', { language: lang }).success(function (response) {
            Authentication.user = response;
          }).error(function (err) {
            $scope.handleShowMessage(err.message, true);
          });
        } else {
          $translate.use(lang);
          Storages.set_local(Constants.storages.language, lang);
          $scope.$broadcast('changeLanguage');
        }
      }
    };

    /**
     * DIALOG CONFIG
     */
    $scope.handleShowConfirm = function (content, handleConfirm, handleReject) {
      $scope.confirmDialog = content;
      dialog.openConfirm({
        scope: $scope,
        templateUrl: Constants.templateUrls.dialogConfirm
      }).then(confirm => {
        delete $scope.confirmDialog;
        if (handleConfirm) {
          handleConfirm(confirm);
        }
      }, reject => {
        delete $scope.confirmDialog;
        if (handleReject) {
          handleReject(reject);
        }
      });
    };
    /**
     * TOAST MESSAGE
     */
    // Hiển thị thông báo với param
    $scope.handleShowMessageWithParam = function (msg, params, error) {
      $translate(msg, params).then(tsl => {
        if (error) {
          toastr.error(tsl, $scope.MS_CM_ERROR);
        } else {
          toastr.success(tsl, $scope.MS_CM_SUCCESS);
        }
      });
    };
    // Hiển thị thông báo bình thường
    $scope.handleShowMessage = function (msg, error) {
      $translate(msg).then(tsl => {
        if (error) {
          toastr.error(tsl, $scope.MS_CM_ERROR);
        } else {
          toastr.success(tsl, $scope.MS_CM_SUCCESS);
        }
      }, err => {
        if (error) {
          toastr.error(msg, $scope.MS_CM_ERROR);
        } else {
          toastr.success(msg, $scope.MS_CM_SUCCESS);
        }
      });
    };
  }
]);
