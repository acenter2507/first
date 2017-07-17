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
    vm.user = Authentication.user;
    vm.isAdmin = _.contains(vm.user.roles, 'admin');

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

    vm.remove = category => {
      if (!vm.isAdmin) {
        toast.error('You are not authorized.', 'Error!');
        return;
      }
      $scope.message_title = 'Delete category!';
      $scope.message_content = 'Are you sure you want to delete this category?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'delete';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
      });
      function handle_delete() {
        vm.categorys = _.without(vm.categorys, category);
        Action.delete_category(category);
      }
    };
  }
}());
