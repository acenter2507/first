(function () {
  'use strict';
  // Polls controller
  angular.module(ApplicationConfiguration.applicationModuleName)
    .controller('UploadImagesController', UploadImagesController);

  UploadImagesController.$inject = [
    '$scope',
    'FileUploader'
  ];

  function UploadImagesController(
    $scope,
    FileUploader
  ) {
    console.log('Called controller');
    var uploader = new FileUploader({
      url: 'api/polls/images',
      alias: 'pollImageUpload'
    });
    uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });
    uploader.onAfterAddingAll = function (addedFileItems) {
      console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
      console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
      console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
      console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
      console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
      console.info('onCompleteAll');
    };
    console.log('Button upload clicked');
  }
})();
