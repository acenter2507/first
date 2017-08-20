(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    'NotifsService',
    'NotifsApi',
    'Authentication',
    '$filter',
    'toastr',
    'ngDialog',
    'Notification'
  ];

  function NotifsListController(
    $rootScope,
    $scope,
    $state,
    NotifsService,
    NotifsApi,
    Authentication,
    $filter,
    toast,
    dialog,
    Notification
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

    $scope.get_notifs = get_notifs;
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
          toast.error('There were problems get your notifications.', 'Error!');
        });
    }

    $scope.view_notif = notif => {
      $state.go(notif.state, { pollId: notif.poll._id, notif: notif._id });
    };
    $scope.mark_read = notif => {
      var status = notif.status === 0 ? 1 : 0;
      console.log(status);
      Notification.markReadNotif(notif._id, status);
      notif.status = status;
    };
    $scope.mark_all_read = () => {
      if (vm.stopped || vm.busy || vm.notifs.length === 0) return;
      vm.busy = true;
      Notification.markReadNotifs()
        .then(() => {
          init();
          get_notifs();
        })
        .catch(err => {
          vm.busy = false;
          toast.error('There were problems get your notifications.', 'Error!');
        });
    };
    $scope.clear_all = () => {
      vm.notifs = [];
      vm.stopped = true;
      Notification.clearNotifs();
    };
  }
}());
