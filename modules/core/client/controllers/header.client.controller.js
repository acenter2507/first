'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', 'Socket', 'NotifsService', 'NotifsApi',
  function($scope, $state, Authentication, Menus, Socket, Notifs, NotifsApi) {
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
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

    $scope.notifs = 0;

    init();

    function init() {
      if ($scope.authentication.user) {
        loadNotifs();
        loadUncheckNotifs();
        initSocket();
      }
    }

    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      console.log('Controller Header loaded.');
      Socket.on('notifs', (res) => {
        loadNotifs();
        loadUncheckNotifs();
        console.log('has new notifs');
      });
    }

    function loadNotifs() {
      return new Promise((resolve, reject) => {
        Notifs.query({ limit: 1 }, (notifs, responseHeaders) => {
          $scope.notifs = notifs || [];
          console.log($scope.notifs);
          return resolve(notifs);
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
