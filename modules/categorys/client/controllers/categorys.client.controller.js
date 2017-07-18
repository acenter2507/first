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
    'Action',
    'toastr',
    'ngDialog'
  ];

  function CategorysController(
    $scope,
    $state,
    $window,
    Authentication,
    category,
    Action,
    toast,
    dialog
  ) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = Authentication.user;
    vm.isLogged = vm.user ? true : false;
    vm.isAdmin = vm.isLogged && _.contains(vm.user.roles, 'admin');

    vm.category = category;

    vm.remove = () => {
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
        Action.delete_category(vm.category);
        $state.go('categorys.list');
      }
    };
  }
}());
