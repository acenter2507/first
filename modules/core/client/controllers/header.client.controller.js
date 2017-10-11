'use strict';

angular.module('core').controller('HeaderController', [
  '$scope',
  '$state',
  'Menus',
  'Notifications',
  'Storages',
  'Constants',
  function ($scope, $state, Menus, Notifications, Storages, Constants) {
    // Expose view variables
    $scope.$state = $state;
    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');
    // Ngôn ngữ đang sử dụng
    $scope.language = Storages.get_local(Constants.storages.language);
    // Từ khóa tìm kiếm
    $scope.search_key = '';
    onCreate();

    function onCreate() {
      prepareScopeListener();
    }
    function prepareScopeListener() {
      // Nghe sự kiện chuyển state để đóng menu collapse
      $scope.$on('$stateChangeSuccess', function () {
        if (angular.element('body').hasClass('aside-menu-show')) {
          angular.element('body').removeClass('aside-menu-show');
        }
      });
      // Nghe sự kiện chuyển thay đổi ngôn ngữ
      $scope.$on('changeLanguage', (event, args) => {
        $scope.language = args.language;
      });
    }
    // Đánh dấu tất cả notifs thành đã xem
    $scope.handleMarkAllNotifRead = () => {
      Notifications.markReadNotifs();
    };
    // Handle search
    $scope.search = () => {
      if ($scope.search_key !== '') {
        $state.go('search', { key: $scope.search_key, in: 'title' });
        $scope.search_key = '';
      }
    };
  }
]);
