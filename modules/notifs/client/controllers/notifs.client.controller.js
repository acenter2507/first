(function () {
  'use strict';

  // Notifs controller
  angular
    .module('notifs')
    .controller('NotifsController', NotifsController);

  NotifsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'notifResolve'];

  function NotifsController ($scope, $state, $window, Authentication, notif) {
    var vm = this;

    vm.authentication = Authentication;
    vm.notif = notif;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Notif
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.notif.$remove($state.go('notifs.list'));
      }
    }

    // Save Notif
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.notifForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.notif._id) {
        vm.notif.$update(successCallback, errorCallback);
      } else {
        vm.notif.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('notifs.view', {
          notifId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
