(function () {
  'use strict';
  // Polls controller
  angular.module('polls').controller('PollImagesController', PollImagesController);

  PollImagesController.$inject = [
    '$scope'
  ];

  function PollImagesController(
    $scope
  ) {
    console.log('Called controller');
  }
})();
