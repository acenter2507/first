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
    'categoryResolve'
  ];

  function CategorysController(
    $scope,
    $state,
    $window,
    Authentication,
    category
  ) {
    var vm = this;
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    vm.category = category;
    vm.bk_category = _.clone(category);
    vm.form = {};

    $scope.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        $scope.Categorys.remove(vm.category);
        $state.go('admin.categorys.list');
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
        $scope.Categorys.add(res);
      }

      function errorCallback(res) {
        $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
      }
    };
  }
}());
