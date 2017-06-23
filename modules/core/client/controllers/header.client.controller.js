'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', 'Socket', 'NotifsService',
  function($scope, $state, Authentication, Menus, Socket, Notifs) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });

    $scope.notifs = 0;

    init();

    function init() {
      if ($scope.authentication.user) {
        loadNotifs();
        initSocket();
      }
    }

    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.on('notifs', (res) => {
        console.log('has new notifs');
      });
    }

    function loadNotifs() {
      return new Promise((resolve, reject) => {
        Notifs.query({ to: $scope.authentication.user._id }, { limit: 10 }, (notifs, responseHeaders) => {
          $scope.notifs = notifs || [];
          console.log($scope.notifs);
          resolve(notifs);
        });
      });
    }

    function loadUncheckNotifs() {
      return new Promise((resolve, reject) => {
        Notifs.query({ to: $scope.authentication.user._id, status: 0 }, (notifs, responseHeaders) => {
          $scope.uncheckNotifs = notifs || [];
          console.log($scope.uncheckNotifs);
          resolve(notifs);
        });
      });
    }
  }
]);
