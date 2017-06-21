(function () {
  'use strict';

  // Cmtlikes controller
  angular
    .module('cmtlikes')
    .controller('CmtlikesController', CmtlikesController);

  CmtlikesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'cmtlikeResolve'];

  function CmtlikesController ($scope, $state, $window, Authentication, cmtlike) {
    var vm = this;

    vm.authentication = Authentication;
    vm.cmtlike = cmtlike;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Cmtlike
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.cmtlike.$remove($state.go('cmtlikes.list'));
      }
    }

    // Save Cmtlike
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cmtlikeForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.cmtlike._id) {
        vm.cmtlike.$update(successCallback, errorCallback);
      } else {
        vm.cmtlike.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('cmtlikes.view', {
          cmtlikeId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
