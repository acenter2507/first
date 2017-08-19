(function () {
  'use strict';
  // Polls controller
  angular.module('core').controller('UploadImagesController', UploadImagesController);

  UploadImagesController.$inject = [
    '$scope'
  ];

  function UploadImagesController(
    $scope
  ) {
    console.log('Called controller');
  }
})();
