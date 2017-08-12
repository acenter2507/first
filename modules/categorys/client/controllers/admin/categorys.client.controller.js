(function () {
  'use strict';

  // Categorys controller
  angular
    .module('categorys')
    .controller('CategorysController', CategorysController);

  CategorysController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'categoryResolve',
    'toastr'
  ];

  function CategorysController(
    $scope,
    $state,
    $window,
    Authentication,
    category,
    toast
  ) {
    var vm = this;
    $scope.user = Authentication.user;
    $scope.isAdmin = _.contains($scope.user.roles, 'admin');
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    vm.category = category;
    vm.bk_category = _.clone(category);
    vm.form = {};

    $scope.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.category.$remove($state.go('admin.categorys.list'));
      }
    };
    $scope.discard = () => {
      function handle_discard() {
        if (vm.category._id) {
          $state.go('admin.categorys.view', { categoryId: vm.category._id });
        } else {
          $state.go('admin.categorys.list');
        }
      }
      if (angular.equals(vm.category, vm.bk_category)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    };
    $scope.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.categoryForm');
        return false;
      }

      if (vm.category._id) {
        vm.category.$update(successCallback, errorCallback);
      } else {
        vm.category.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('admin.categorys.view', {
          categoryId: res._id
        });
      }

      function errorCallback(res) {
        toast.error(res.data.message, 'Error!');
        console.log(res);
      }
    };
  }
}());
