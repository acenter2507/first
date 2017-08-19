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
    $scope.results = [];
    $scope.uploader = new FileUploader({
      url: 'api/polls/images',
      alias: 'imagesUpload'
    });
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });
    // $scope.uploader.onAfterAddingAll = function (addedFileItems) {
    //   console.info('onAfterAddingAll', addedFileItems);
    // };
    $scope.uploader.onBeforeUploadItem = function (item) {
      // console.info('onBeforeUploadItem', item);
      $scope.uploadingFileName = item._file.name;
    };
    // $scope.uploader.onProgressItem = function (fileItem, progress) {
    //   console.info('onProgressItem', fileItem, progress);
    // };
    // $scope.uploader.onProgressAll = function (progress) {
    //   console.info('onProgressAll', progress);
    // };
    // $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
    //   console.info('onSuccessItem', fileItem, response, status, headers);
    // };
    // $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
    //   console.info('onErrorItem', fileItem, response, status, headers);
    // };
    // $scope.uploader.onCancelItem = function (fileItem, response, status, headers) {
    //   console.info('onCancelItem', fileItem, response, status, headers);
    // };
    $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
      console.info('onCompleteItem', fileItem, response, status, headers);
    };
    $scope.uploader.onCompleteAll = function () {
      closeThisDialog('This my data');
    };
    $scope.btn_upload_click = () => {
      angular.element('#fileInput').trigger('click');
    };
  }
})();
