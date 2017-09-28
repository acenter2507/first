(function () {
  'use strict';
  angular
    .module('opts.admin')
    .controller('AdminOptsController', AdminOptsController);

  AdminOptsController.$inject = [
    '$state',
    '$scope',
    '$window'
  ];

  function AdminOptsController(
    $state,
    $scope,
    $window
  ) {
    var vm = this;
  }
})();
