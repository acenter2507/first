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
  'Storages',
  'Constants',
  function ($rootScope, $scope, $state, Authentication, Menus, Socket, Notifs, NotifsApi, Storages, Constants) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;
    $scope.isAdmin = _.contains($scope.authentication.user.roles, 'admin');

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Nghe sự kiện login thành công để load menu
    $rootScope.$on('loginSuccess', () => {
      init();
    });
    // Nghe sự kiện update Notif để load notifs
    $rootScope.$on('changeNotif', () => {
      if ($scope.authentication.user) {
        loadNotifs(10);
        loadUncheckNotifs();
      }
    });
    // Nghe sự kiện chuyển state để đóng menu collapse
    $scope.$on('$stateChangeSuccess', function () {
      if (angular.element('body').hasClass('aside-menu-show')) {
        angular.element('body').removeClass('aside-menu-show');
      }
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
        loadNotifs(10);
        loadUncheckNotifs();
      });
      Socket.on('activity', res => {
        res.time = moment().format();
        let activitys = JSON.parse(Storages.get_session(Constants.storages.activitys, JSON.stringify([])));
        activitys.push(res);
        Storages.set_session(Constants.storages.activitys, JSON.stringify(activitys));
        $rootScope.$emit('activity');
      });
      $scope.$on('$destroy', function () {
        Socket.removeListener('activity');
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
