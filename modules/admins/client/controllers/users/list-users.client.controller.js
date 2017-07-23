'use strict';
angular.module('admin')
  .controller('UserListController', UserListController);
UserListController.$inject = ['$scope', '$filter', 'Admin', 'AdminApi', 'toastr', 'ngDialog'];

function UserListController($scope, $filter, Admin, AdminApi, toast, dialog) {
  $scope.busy = true;
  Admin.query(function (data) {
    $scope.users = data;
    get_users_info().then(() => {
      $scope.busy = false;
      $scope.buildPager();
    });
  });
  function get_users_info() {
    return new Promise((resolve, reject) => {
      var promise = [];
      $scope.users.forEach(user => {
        promise.push(get_user_report(user));
        promise.push(get_user_reported(user));
      });
      Promise.all(promise)
        .then(res => {
          return resolve();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          return reject();
        });
    });
  }
  function get_user_report(user) {
    return new Promise((resolve, reject) => {
      AdminApi.user_report(user._id)
        .then(res => {
          user.report = res.data;
          return resolve();
        })
        .catch(err => {
          return reject();
        });
    });
  }
  // Đã bị report
  function get_user_reported(user) {
    return new Promise((resolve, reject) => {
      AdminApi.user_reported(user._id)
        .then(res => {
          user.reported = res.data;
          return resolve();
        })
        .catch(err => {
          return reject();
        });
    });
  }

  $scope.buildPager = function () {
    $scope.pagedItems = [];
    $scope.itemsPerPage = 15;
    $scope.currentPage = 1;
    $scope.filter = {};
    $scope.figureOutItemsToDisplay();
    $scope.$apply();
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
      user.$remove(() => {
        $scope.users = _.without($scope.users, user);
        $scope.figureOutItemsToDisplay();
        toast.success('You have deleted: ' + user.displayName, 'Thank you!');
      });
    }
  };
}

