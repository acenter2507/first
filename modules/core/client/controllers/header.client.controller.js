'use strict';

angular.module('core').controller('HeaderController', [
  '$rootScope',
  '$scope',
  '$state',
  'Authentication',
  'Menus',
  'Socket',
  'NotifsService',
  'NotifsApi',
  function ($rootScope, $scope, $state, Authentication, Menus, Socket, Notifs, NotifsApi) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    $rootScope.$on('loginSuccess', () => {
      init();
    });
    $rootScope.$on('changeNotif', () => {
      if ($scope.authentication.user) {
        loadUncheckNotifs();
      }
    });
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

    init();

    function init() {
      if ($scope.authentication.user) {
        loadNotifs(10);
        loadUncheckNotifs();
        initSocket();
      }
    }

    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.on('notifs', res => {
        console.log('Has new notifs');
        loadNotifs(10);
        loadUncheckNotifs();
      });
    }

    function loadNotifs(limit) {
      return new Promise((resolve, reject) => {
        NotifsApi.findNotifs(limit)
          .then(res => {
            $scope.notifs = res.data || [];
            return resolve(res.data);
          })
          .catch(err => {
            alert(err + '');
            return reject(err);
          });
      });
    }

    function loadUncheckNotifs() {
      return new Promise((resolve, reject) => {
        NotifsApi.countUnchecks()
          .then(res => {
            $scope.uncheckNotifs = res.data || 0;
            $rootScope.$emit('updateNotif', $scope.uncheckNotifs);
            return resolve(res.data);
          })
          .catch(err => {
            console.log(err + '');
            return reject();
          });
      });
    }
    $scope.mark_all_read = () => {
      NotifsApi.markAllRead()
        .then(res => {
          loadNotifs(10);
          loadUncheckNotifs();
        });
    };
    $scope.search_key = '';
    $scope.search = () => {
      if ($scope.search_key !== '') {
        $state.go('search', { key: $scope.search_key, in: 'title' });
      }
    };

  }
]);
