'use strict';

angular.module('core').controller('HeaderController', [
  '$scope',
  '$state',
  'Menus',
  'Notification',
  function ($scope, $state, Menus, Notification) {
    // Expose view variables
    $scope.$state = $state;
    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Nghe sự kiện login thành công để load menu
    // $rootScope.$on('loginSuccess', () => {
    //   console.log('loginSuccess');
    //   init();
    // });
    // Nghe sự kiện update Notif để load notifs
    // $rootScope.$on('changeNotif', () => {
    //   // if ($scope.authentication.user) {
    //   if ($scope.user) {
    //     loadNotifs(10);
    //     loadUncheckNotifs();
    //   }
    // });
    // Nghe sự kiện chuyển state để đóng menu collapse
    $scope.$on('$stateChangeSuccess', function () {
      if (angular.element('body').hasClass('aside-menu-show')) {
        angular.element('body').removeClass('aside-menu-show');
      }
    });

    // init();
    // function init() {
    //   if ($scope.isLogged) {
    //     initSocket();
    //   }
    // }

    // function initSocket() {
    //   if (!Socket.socket) {
    //     Socket.connect();
    //   }
    //   Socket.on('notifs', res => {
    //     Notification.loadNotifs();
    //   });
    //   Socket.on('activity', res => {
    //     res.time = moment().format();
    //     let activitys = JSON.parse(Storages.get_session(Constants.storages.activitys, JSON.stringify([])));
    //     activitys.push(res);
    //     Storages.set_session(Constants.storages.activitys, JSON.stringify(activitys));
    //     $rootScope.$emit('activity');
    //   });
    //   $scope.$on('$destroy', function () {
    //     Socket.removeListener('activity');
    //   });
    // }

    // function loadNotifs(limit) {
    //   return new Promise((resolve, reject) => {
    //     NotifsApi.findNotifs(limit)
    //       .then(res => {
    //         $scope.notifs = res.data || [];
    //         return resolve(res.data);
    //       })
    //       .catch(err => {
    //         alert(err + '');
    //         return reject(err);
    //       });
    //   });
    // }

    // function loadUncheckNotifs() {
    //   return new Promise((resolve, reject) => {
    //     NotifsApi.countUnchecks()
    //       .then(res => {
    //         $scope.uncheckNotifs = res.data || 0;
    //         $rootScope.$emit('updateNotif', $scope.uncheckNotifs);
    //         return resolve(res.data);
    //       })
    //       .catch(err => {
    //         console.log(err + '');
    //         return reject();
    //       });
    //   });
    // }
    $scope.mark_all_read = () => {
      Notification.markReadNotifs();
      // NotifsApi.markAllRead()
      //   .then(res => {
      //     loadNotifs(10);
      //     loadUncheckNotifs();
      //   });
    };
    $scope.search_key = '';
    $scope.search = () => {
      if ($scope.search_key !== '') {
        $state.go('search', { key: $scope.search_key, in: 'title' });
      }
    };

  }
]);
