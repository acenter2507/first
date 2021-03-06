(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = [
    '$scope',
    '$state',
    'NotifsApi',
    'Notifications'
  ];

  function NotifsListController(
    $scope,
    $state,
    NotifsApi,
    Notifications
  ) {
    var vm = this;
    init();
    function init() {
      vm.notifs = [];
      // Infinity scroll
      vm.stopped = false;
      vm.busy = false;
      vm.page = 0;
    }

    vm.get_notifs = get_notifs;
    function get_notifs() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      NotifsApi.findNotifs(10, vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          vm.notifs = _.union(vm.notifs, res.data);
          vm.page += 1;
          vm.busy = false;
        })
        .catch(err => {
          vm.busy = false;
          vm.stopped = true;
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }

    vm.view_notif = notif => {
      $state.go(notif.state, { pollId: notif.poll.slug, notif: notif._id });
    };
    vm.mark_read = notif => {
      var status = notif.status === 0 ? 1 : 0;
      Notifications.markReadNotif(notif._id, status);
      notif.status = status;
    };
    vm.handleMarkAllNotifRead = () => {
      if (vm.stopped || vm.busy || vm.notifs.length === 0) return;
      vm.busy = true;
      Notifications.markReadNotifs()
        .then(() => {
          init();
          get_notifs();
        })
        .catch(err => {
          vm.busy = false;
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    vm.clear_all = () => {
      vm.notifs = [];
      vm.stopped = true;
      Notifications.clearNotifs();
    };
  }
}());
