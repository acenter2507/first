(function () {
  'use strict';
  // Polls controller
  angular.module(ApplicationConfiguration.applicationModuleName)
    .controller('UploadImagesController', UploadImagesController);

  UploadImagesController.$inject = [
    '$scope'
  ];

  function UploadImagesController(
    $scope
  ) {
    console.log('Called controller');
  }
})();
