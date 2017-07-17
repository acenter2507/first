(function () {
  'use strict';

  angular
    .module('categorys')
    .controller('CategorysListController', CategorysListController);

  CategorysListController.$inject = [
    'CategorysService',
    'Action'
  ];

  function CategorysListController(CategorysService, Action) {
    var vm = this;

    var promise = CategorysService.query().$promise;
    promise.then(_categorys => {
      vm.categorys = _categorys || [];
      vm.categorys.forEach(function (category) {
        Action.count_poll_for_category(category._id)
          .then(res => {
            category.count = res.data || 0;
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }, this);
    });
  }
}());
