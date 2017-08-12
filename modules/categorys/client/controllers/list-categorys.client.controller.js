(function () {
  'use strict';

  angular
    .module('categorys')
    .controller('CategorysListController', CategorysListController);

  CategorysListController.$inject = [
    '$scope',
    'CategorysService',
    'Authentication',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function CategorysListController(
    $scope,
    CategorysService,
    Authentication,
    Action,
    toast,
    dialog
    ) {
    var vm = this;
    var promise = CategorysService.query().$promise;
    promise.then(_categorys => {
      vm.categorys = _categorys || [];
    });
  }
}());
