(function () {
  'use strict';

  // Tags controller
  angular
    .module('tags.admin')
    .controller('TagsController', TagsController);

  TagsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'tagResolve',
    'toastr'
  ];

  function TagsController(
    $scope,
    $state,
    $window,
    Authentication,
    tag,
    toast
  ) {
    var vm = this;
    $scope.user = Authentication.user;
    $scope.isAdmin = _.contains($scope.user.roles, 'admin');
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    vm.tag = tag;
    vm.bk_tag = _.clone(tag);
    vm.form = {};

    // Remove existing Tag
    $scope.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.tag.$remove($state.go('admin.tags.list'));
      }
    }
    $scope.discard = () => {
      function handle_discard() {
        $state.go('admin.tags.list');
      }
      if (angular.equals(vm.tag, vm.bk_tag)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    };
    $scope.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tagForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tag._id) {
        vm.tag.$update(successCallback, errorCallback);
      } else {
        vm.tag.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        toast.success("Tag created", 'Success!');
      }

      function errorCallback(res) {
        toast.error(res.data.message, 'Error!');
        console.log(res);
      }
    }
  }
}());
