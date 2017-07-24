'use strict';
angular.module('admin')
  .controller('UserListController', UserListController);
UserListController.$inject = ['$scope', '$filter', 'Admin', 'AdminApi', 'toastr', 'ngDialog'];

function UserListController($scope, $filter, Admin, AdminApi, toast, dialog) {
  $scope.busy = true;
  get_users();
  function get_users() {
    AdminApi.get_users()
      .then(res => {
        $scope.users = res.data;
        $scope.busy = false;
        $scope.buildPager();
      })
      .catch(err => {
        toast.error('Can\'t load users: ' + err.message, 'Error!');
      });
  }

  $scope.buildPager = function () {
    $scope.pagedItems = [];
    $scope.itemsPerPage = 15;
    $scope.currentPage = 1;
    $scope.filter = {};
    $scope.figureOutItemsToDisplay();
  };

  $scope.figureOutItemsToDisplay = function () {
    if ($scope.busy) return;
    $scope.busy = true;
    $scope.filteredItems = $filter('users_filter')($scope.users, $scope.filter);
    $scope.filterLength = $scope.filteredItems.length;
    var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    $scope.busy = false;
  };

  $scope.pageChanged = function () {
    $scope.figureOutItemsToDisplay();
  };

  $scope.filter_min = true;
  $scope.clear_filter = () => {
    $scope.filter = {};
    $scope.figureOutItemsToDisplay();
  };
  $scope.delete_user = user => {
    $scope.message_title = 'Delete user!';
    $scope.message_content = 'Are you sure you want to delete this user?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_user = new Admin({ _id: user._id });
      rs_user.$remove(() => {
        $scope.users = _.without($scope.users, user);
        $scope.figureOutItemsToDisplay();
        toast.success('You have deleted: ' + user.displayName, 'Thank you!');
      });
    }
  };
}

