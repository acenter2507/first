(function () {
  'use strict';
  angular.module('opts.admin').controller('AdminOptController', AdminOptController);

  AdminOptController.$inject = [
    '$scope',
    '$state',
    '$window'
  ];

  function AdminOptController(
    $scope,
    $state,
    $window,
    opt
  ) {
    var ctrl = this;
  }
})();
