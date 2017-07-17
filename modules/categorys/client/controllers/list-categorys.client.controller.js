(function () {
  'use strict';

  angular
    .module('categorys')
    .controller('CategorysListController', CategorysListController);

  CategorysListController.$inject = [
    'CategorysService',
    'Authentication',
    'Action'
  ];

  function CategorysListController(CategorysService, Authentication, Action) {
    var vm = this;
    vm.user = Authentication.user;
    console.log(vm.user);
    vm.isAdmin = () => {

    };

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
