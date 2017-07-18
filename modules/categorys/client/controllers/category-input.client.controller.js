(function () {
  'use strict';

  // Categorys controller
  angular
    .module('categorys')
    .controller('CategoryInputController', CategorysController);

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
    vm.isAdmin = _.contains(vm.user.roles, 'admin');

    vm.category = category;
    vm.bk_category = _.clone(category);
    vm.error = null;
    vm.form = {};

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
        Action.delete_category(vm.category)
          .then(() => {
            $state.go('categorys.list');
          });
      }
    };
    vm.discard = () => {
      if (angular.equals(vm.category, vm.bk_category)) {
        handle_discard();
      } else {
        $scope.message_title = 'Discard category!';
        $scope.message_content = 'Are you sure you want to discard?';
        $scope.dialog_type = 2;
        $scope.buton_label = 'Discard';
        dialog.openConfirm({
          scope: $scope,
          templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
        }).then(confirm => {
          handle_discard();
        }, reject => {
        });
      }
    };

    function handle_discard() {
      if (vm.category._id) {
        $state.go('categorys.view', { categoryId: vm.category._id });
      } else {
        $state.go('categorys.list');
      }
    }
    vm.save = save;
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
