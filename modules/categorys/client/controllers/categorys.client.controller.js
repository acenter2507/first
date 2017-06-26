(function () {
  'use strict';

  // Categorys controller
  angular
    .module('categorys')
    .controller('CategorysController', CategorysController);

  CategorysController.$inject = ['$scope', '$state', '$window', 'Authentication', 'categoryResolve'];

  function CategorysController ($scope, $state, $window, Authentication, category) {
    var vm = this;

    vm.authentication = Authentication;
    vm.category = category;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Category
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.category.$remove($state.go('categorys.list'));
      }
    }

    // Save Category
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.categoryForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.category._id) {
        vm.category.$update(successCallback, errorCallback);
      } else {
        vm.category.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('categorys.view', {
          categoryId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
