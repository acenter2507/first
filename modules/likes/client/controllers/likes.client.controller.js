(function () {
  'use strict';

  // Likes controller
  angular
    .module('likes')
    .controller('LikesController', LikesController);

  LikesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'likeResolve'];

  function LikesController ($scope, $state, $window, Authentication, like) {
    var vm = this;

    vm.authentication = Authentication;
    vm.like = like;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Like
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.like.$remove($state.go('likes.list'));
      }
    }

    // Save Like
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.likeForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.like._id) {
        vm.like.$update(successCallback, errorCallback);
      } else {
        vm.like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('likes.view', {
          likeId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
