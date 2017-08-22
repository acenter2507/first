'use strict';

angular.module('core').controller('HeaderController', [
  '$scope',
  '$state',
  'Menus',
  'Notifications',
  function ($scope, $state, Menus, Notifications) {
    // Expose view variables
    $scope.$state = $state;
    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Nghe sự kiện chuyển state để đóng menu collapse
    $scope.$on('$stateChangeSuccess', function () {
      if (angular.element('body').hasClass('aside-menu-show')) {
        angular.element('body').removeClass('aside-menu-show');
      }
    });

    $scope.mark_all_read = () => {
      Notifications.markReadNotifs();
    };
    $scope.search_key = '';
    $scope.search = () => {
      if ($scope.search_key !== '') {
        $state.go('search', { key: $scope.search_key, in: 'title' });
      }
    };

  }
]);
