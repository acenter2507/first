'use strict';
angular.module('users.admin')
  .controller('AdminUserController', AdminUserController);
AdminUserController.$inject = ['$window', '$timeout', '$scope', '$state', 'userResolve', 'AdminUserApi', 'Constants', 'FileUploader'];


function AdminUserController($window, $timeout, $scope, $state, userResolve, AdminUserApi, Constants, FileUploader) {
  var vm = this;
  vm.user = userResolve;

  // New and Edit screen
  vm.handleSaveUser = isValid => {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'userForm');
      return false;
    }
    var user = vm.user;
    if (user._id) {
      user.$update(successCb, errorCb);
    } else {
      user.$save(successCb, errorCb);
    }

    function successCb(res) {
      $state.reload();
    }
    function errorCb(err) {
      alert('Can\'t save user: ' + err.message);
    }
  };

  vm.handleDeleteUser = () => {
    if ($window.confirm('Are you sure you want to delete?')) {
      vm.user.$remove($state.go('admin.users.list'));
    }
  };
  vm.handlePushVerify = () => {
  };
  vm.handleBlockUser = () => {
    if ($window.confirm('Are you sure you want to block?')) {
      var rs_user = new AdminUserService({ _id: vm.user._id });
      rs_user.status = 3;
      rs_user.$update(() => {
        alert('Done');
      });
    }
  };
  vm.handleUnBlockUser = () => {
    if ($window.confirm('Are you sure you want to unblock?')) {
      var rs_user = new AdminUserService({ _id: vm.user._id });
      rs_user.status = 2;
      rs_user.$update(() => {
        alert('Done');
      });
    }
  };
  vm.handleResetPassword = () => {
    var pass = $window.prompt('Enter new password:');
    if (!pass) return;
    if (pass === '' || pass.length < 8 || pass.length > 32)
      return alert('Password failed.');
    AdminUserApi.resetUserPassword(vm.user._id, pass)
      .success(res => {
        alert('Done');
      })
      .error(err => {
        console.log(err);
        alert(err.message);
      });
  };
}
