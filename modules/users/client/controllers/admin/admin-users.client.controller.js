'use strict';
angular.module('users.admin')
  .controller('AdminUsersController', AdminUsersController);
AdminUsersController.$inject = ['$scope', '$filter', '$window', 'AdminUserService', 'AdminUserApi'];

function AdminUsersController($scope, $filter, $window, AdminUserService, AdminUserApi) {
  var vm = this;
  vm.users = [];
  vm.busy = false;
  vm.page = 1;
  vm.condition = {};
  vm.totalPage = 0;
  vm.totalUser = 0;
  vm.sort = '-created';
  vm.supportedLanguages = $window.supportLanguages;

  onCreate();

  function onCreate() {
    handleLoadUsers();
  }
  /**
   * HANDLES
   */
  function handleLoadUsers() {
    AdminUserApi.loadAdminUsers(vm.page, vm.condition)
      .success(res => {
        vm.users = res.docs;
        vm.totalPage = createArrayFromRange(res.pages);
        vm.totalUser = res.total;
      })
      .error(err => {
        alert(err.message);
      });
  }

  vm.handleSearch = () => {
    vm.page = 1;
    handleLoadUsers();
  };

  vm.handleCreateTestUsers = () => {
    if (vm.busy) return;
    vm.busy = true;
    var numberOfUser = $window.prompt('Number of users to generate', 0);
    var passWord = $window.prompt('Password for all', '');
    AdminUserApi.generateUsers(numberOfUser, passWord).then(res => {
      vm.page = 1;
      handleLoadUsers();
      vm.busy = false;
    }).catch(err => {
      vm.busy = false;
      alert(err.message);
    });
  };

  vm.handleChangePage = page => {
    vm.page = page;
    handleLoadUsers();
  };

  vm.handleDeleteUser = user => {
    if ($window.confirm('Are you sure you want to delete?')) {
      var rs_user = new AdminUserService({ _id: user._id });
      rs_user.$remove(() => {
        $scope.users = _.without($scope.users, user);
        $scope.figureOutItemsToDisplay();
      });
    }
  };

  vm.handleClearCondition = () => {
    vm.condition = {};
    vm.page = 1;
    handleLoadUsers();
  };

  vm.handleResetPassword = user => {
    var pass = $window.prompt('Enter new password:');
    if (pass === '' || pass.length < 8 || pass.length > 32)
      return alert('Password failed.');
    AdminUserApi.resetUserPassword(user._id, pass)
      .success(res => {
        alert('Done');
      })
      .error(err => {
        console.log(err);
        alert(err.message);
      });
  };

  function createArrayFromRange(range) {
    var array = [];
    for (var i = 1; i <= range; i++) {
      array.push(i);
    }
    return array;
  }
}