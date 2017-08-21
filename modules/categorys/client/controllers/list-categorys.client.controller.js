(function () {
  'use strict';

  angular
    .module('categorys')
    .controller('CategorysListController', CategorysListController);

  CategorysListController.$inject = [
    '$scope',
    'CategorysService'
  ];

  function CategorysListController(
    $scope,
    CategorysService
    ) {
    var vm = this;
    var promise = CategorysService.query().$promise;
    promise.then(_categorys => {
      vm.categorys = _categorys || [];
    });
  }
}());
