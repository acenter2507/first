(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = [
    '$scope',
    'NotifsApi',
    'Authentication',
    '$filter',
    'toastr',
    'ngDialog'
  ];

  function NotifsListController(
    $scope,
    NotifsApi,
    Authentication,
    $filter,
    toast,
    dialog
  ) {
    var vm = this;
    vm.notifs = [];

    // Infinity scroll
    $scope.stopped = false;
    $scope.busy = false;
    $scope.page = 0;
    $scope.get_notifs = get_notifs;
    function get_notifs() {
      if ($scope.stopped || $scope.busy) return;
      $scope.busy = true;
      NotifsApi.findNotifs(10, $scope.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.stopped = true;
            $scope.busy = false;
            return;
          }
          vm.notifs = _.union(vm.notifs, res.data);
          $scope.page += 1;
          $scope.busy = false;
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          toast.error('There were problems get your notifications.', 'Error!');
        });
    }

    $scope.mark_read = notif => {
      console.log(notif);
      return false;
    };
  }
}());
