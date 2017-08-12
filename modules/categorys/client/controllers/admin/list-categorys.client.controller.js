(function () {
  'use strict';

  angular
    .module('categorys.admin')
    .controller('AdminCategorysListController', AdminCategorysListController);

  AdminCategorysListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'CategorysService',
    'Authentication',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function AdminCategorysListController(
    $scope,
    $state,
    $window,
    CategorysService,
    Authentication,
    Action,
    toast,
    dialog
    ) {
    var vm = this;
    $scope.user = Authentication.user;
    $scope.isAdmin = _.contains($scope.user.roles, 'admin');
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    vm.categorys = CategorysService.query();
    console.log(vm.categorys);

    $scope.remove = category => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.categorys = _.without(vm.categorys, category);
        category.$remove();
      }
    };
  }
}());
