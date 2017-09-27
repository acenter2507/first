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
      var lang = Storages.get_local(Constants.storages.language);
      if ($scope.isLogged && $scope.user.language !== lang) {
        // Lưu ngôn ngữ vào web storage
        Storages.set_local(Constants.storages.language, $scope.user.language);
        // Tiến hành đổi ngôn ngữ
        $translate.use($scope.user.language).then(() => {
          // Thay đổi ngôn ngữ angular moment
          amMoment.changeLocale($scope.user.language);
          // Thay đổi local 
          var tz = $window.locales[$scope.user.language];
          moment.tz.setDefault(tz);
          moment.locale($scope.user.language);
          // Thông báo cho navbar biết đã thay đổi ngôn ngữ
          $scope.$broadcast('changeLanguage', { language: $scope.user.language });
        });
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
    $scope.handleChangeLanguage = () => {
      $scope.langDialog = {
        languages = $window.supportLanguages,
        language: $translate.use()
      };
      dialog.openConfirm({
        scope: $scope,
        templateUrl: Constants.templateUrls.languageChange
      }).then(lang => {
        delete $scope.langDialog;
        handleSaveLanguage(lang);
      }, reject => {
        delete $scope.langDialog;
      });
      // if (lang === $translate.use()) return;
      // $translate(['MS_USERS_LANG_CONFIRM', lang]).then(tsl => {
      //   var content = tsl.MS_USERS_LANG_CONFIRM + tsl[lang];
      //   $scope.handleShowConfirm({
      //     content: content,
      //     type: 1,
      //     button: 'LB_CHANGE'
      //   }, confirm => {
      //     handleSaveLanguage();
      //   });
      // });
      function handleSaveLanguage(lang) {
        if (lang === $translate.use()) return;
        if ($scope.isLogged) {
          $http.post('/api/users/language', { language: lang }).success(function (response) {
            window.location.reload();
          }).error(function (err) {
            $scope.handleShowMessage(err.message, true);
          });
        } else {
          Storages.set_local(Constants.storages.language, lang);
          window.location.reload();
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
