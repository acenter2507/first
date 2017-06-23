'use strict';

angular.module('core').controller('HeaderController', [
  '$scope',
  '$state',
  'Authentication',
  'Menus',
  'Socket',
  'NotifsService',
  'NotifsApi',
  function ($scope, $state, Authentication, Menus, Socket, Notifs, NotifsApi) {
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

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.isCollapsed = false;
      console.log('toState', toState);
    });

    $scope.notifs = 0;

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
        loadNotifs(10);
        loadUncheckNotifs();
        console.log('has new notifs');
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
            return resolve(res.data);
          })
          .catch(err => {
            console.log(err + '');
            return reject();
          });
      });
    }
  }
]);
